import os
import secrets
import time
from functools import wraps
from typing import Any, Dict, List, Tuple
from urllib.parse import urlencode

import jwt
import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, render_template_string, request, session
from jwt import PyJWKClient

load_dotenv()

FLASK_SECRET_KEY = os.environ.get("FLASK_SECRET_KEY")
if not FLASK_SECRET_KEY:
    raise RuntimeError("FLASK_SECRET_KEY environment variable must be set.")

app = Flask(__name__)
app.config.update(
    SECRET_KEY=FLASK_SECRET_KEY,
    SESSION_COOKIE_NAME="yasukari_session",
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=os.environ.get("FLASK_ENV") == "production",
)

COGNITO_REGION = os.environ.get("COGNITO_REGION", "ap-northeast-1")
COGNITO_USER_POOL_ID = os.environ.get("COGNITO_USER_POOL_ID")
COGNITO_CLIENT_ID = os.environ.get("COGNITO_CLIENT_ID")
COGNITO_CLIENT_SECRET = os.environ.get("COGNITO_CLIENT_SECRET")
COGNITO_DOMAIN = os.environ.get("COGNITO_DOMAIN", "").rstrip("/")
COGNITO_REDIRECT_URI = os.environ.get(
    "COGNITO_REDIRECT_URI", "http://localhost:5000/auth/callback"
)
COGNITO_LOGOUT_REDIRECT_URI = os.environ.get(
    "COGNITO_LOGOUT_REDIRECT_URI", "http://localhost:3000/"
)
FRONTEND_MYPAGE_URL = os.environ.get(
    "FRONTEND_MYPAGE_URL", "http://localhost:3000/mypage"
)
FRONTEND_LOGIN_URL = os.environ.get(
    "FRONTEND_LOGIN_URL", "http://localhost:3000/login"
)

if not all(
    [COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID, COGNITO_CLIENT_SECRET, COGNITO_DOMAIN]
):
    raise RuntimeError("Missing required Cognito configuration environment variables.")

ISSUER = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}"
JWKS_URL = f"{ISSUER}/.well-known/jwks.json"
CognitoAttribute = Dict[str, str]
CognitoError = Dict[str, Any]

COGNITO_API_ENDPOINT = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/"

_jwks_client: PyJWKClient | None = None
_jwks_cache_time: float | None = None


def _normalize_phone_number(value: Any) -> str:
    if not isinstance(value, str):
        return ""
    trimmed = value.strip()
    if not trimmed:
        return ""
    if not trimmed.startswith("+"):
        return "+" + "".join(ch for ch in trimmed if ch.isdigit())
    return "".join(trimmed.split())


def _normalize_text(value: Any) -> str:
    return value.strip() if isinstance(value, str) else ""


def _map_attributes(attributes: List[CognitoAttribute] | None) -> Dict[str, str]:
    mapped: Dict[str, str] = {}
    for attribute in attributes or []:
        name = attribute.get("Name")
        if name:
            mapped[name] = attribute.get("Value", "")
    return mapped


def _call_cognito(
    target: str, access_token: str, body: Dict[str, Any]
) -> Dict[str, Any]:
    response = requests.post(
        COGNITO_API_ENDPOINT,
        headers={
            "Content-Type": "application/x-amz-json-1.1",
            "X-Amz-Target": target,
        },
        json={**body, "AccessToken": access_token},
        timeout=10,
    )

    if response.ok:
        return response.json()

    message = f"Failed to call Cognito ({response.status_code})"
    try:
        data: CognitoError = response.json()
        if isinstance(data, dict) and data.get("message"):
            message = str(data.get("message"))
    except Exception:
        pass

    raise RuntimeError(message)


def _validate_update_payload(payload: Dict[str, Any]) -> Tuple[List[CognitoAttribute], str | None]:
    attributes: List[CognitoAttribute] = []

    phone = _normalize_phone_number(payload.get("phone_number"))
    if phone:
        if not phone.startswith("+") or not phone[1:].isdigit() or not (8 <= len(phone) <= 20):
            return attributes, "電話番号の形式が正しくありません。国番号を含めて入力してください。"
        attributes.append({"Name": "phone_number", "Value": phone})

    name = _normalize_text(payload.get("name"))
    if name:
        attributes.append({"Name": "name", "Value": name})

    handle = _normalize_text(payload.get("handle"))
    if handle:
        if len(handle) < 3 or len(handle) > 30:
            return attributes, "ハンドルネームは3文字以上30文字以内で入力してください。"
        attributes.append({"Name": "custom:handle", "Value": handle})

    locale = _normalize_text(payload.get("locale"))
    if locale:
        if len(locale) < 2 or len(locale) > 5:
            return attributes, "ロケールは2〜5文字で入力してください。"
        attributes.append({"Name": "custom:locale", "Value": locale})

    if payload.get("phone_number_verified"):
        attributes.append({"Name": "phone_number_verified", "Value": "true"})

    return attributes, None


class OAuthStateError(Exception):
    pass


class TokenVerificationError(Exception):
    pass


def login_required(view_func):
    @wraps(view_func)
    def wrapped(*args, **kwargs):
        if not session.get("user"):
            return redirect("/auth/login")
        return view_func(*args, **kwargs)

    return wrapped


def get_jwks_client() -> PyJWKClient:
    global _jwks_client, _jwks_cache_time
    now = time.time()
    if _jwks_client and _jwks_cache_time and now - _jwks_cache_time < 3600:
        return _jwks_client

    response = requests.get(JWKS_URL, timeout=5)
    response.raise_for_status()
    _jwks_cache_time = now
    _jwks_client = PyJWKClient(JWKS_URL)
    return _jwks_client


def verify_id_token(id_token: str) -> Dict[str, Any]:
    jwks_client = get_jwks_client()
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(id_token).key
        claims = jwt.decode(
            id_token,
            signing_key,
            algorithms=["RS256"],
            audience=COGNITO_CLIENT_ID,
            issuer=ISSUER,
        )
    except Exception as exc:  # noqa: BLE001
        raise TokenVerificationError("ID token verification failed") from exc

    token_use = claims.get("token_use")
    if token_use != "id":
        raise TokenVerificationError(f"Unexpected token_use: {token_use}")
    return claims


def build_authorize_url(state: str) -> str:
    params = {
        "client_id": COGNITO_CLIENT_ID,
        "response_type": "code",
        "scope": "openid email phone profile aws.cognito.signin.user.admin",
        "redirect_uri": COGNITO_REDIRECT_URI,
        "state": state,
    }
    return f"{COGNITO_DOMAIN}/oauth2/authorize?{urlencode(params)}"


def exchange_code_for_tokens(code: str) -> Dict[str, Any]:
    token_url = f"{COGNITO_DOMAIN}/oauth2/token"
    data = {
        "grant_type": "authorization_code",
        "client_id": COGNITO_CLIENT_ID,
        "client_secret": COGNITO_CLIENT_SECRET,
        "code": code,
        "redirect_uri": COGNITO_REDIRECT_URI,
    }
    response = requests.post(
        token_url,
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=5,
    )
    response.raise_for_status()
    return response.json()


def _validate_state(state: str | None):
    if not state:
        raise OAuthStateError("State parameter is missing")

    expected = session.get("oauth_state")
    issued_at = session.get("oauth_state_issued_at", 0)
    if not expected:
        raise OAuthStateError("State not found in session")

    if state != expected:
        raise OAuthStateError("State mismatch")

    if time.time() - issued_at > 600:
        raise OAuthStateError("State has expired")


def _redirect_to_login_with_error(message: str):
    params = {"error": message}
    return redirect(f"{FRONTEND_LOGIN_URL}?{urlencode(params)}")


@app.route("/auth/login")
def login():
    state = secrets.token_urlsafe(24)
    session["oauth_state"] = state
    session["oauth_state_issued_at"] = time.time()
    authorize_url = build_authorize_url(state)
    return jsonify({"authorize_url": authorize_url})


@app.route("/auth/callback")
def auth_callback():
    error = request.args.get("error")
    error_description = request.args.get("error_description")
    if error:
        message = error_description or error
        return _redirect_to_login_with_error(f"Login failed: {message}")

    state = request.args.get("state")
    code = request.args.get("code")
    skip_state_validation = state == "signup"

    try:
        if not skip_state_validation:
            _validate_state(state)
    except OAuthStateError as exc:
        return _redirect_to_login_with_error(str(exc))

    if not code:
        return _redirect_to_login_with_error("Authorization code is missing")

    try:
        token_response = exchange_code_for_tokens(code)
        id_token = token_response.get("id_token")
        access_token = token_response.get("access_token")
        if not id_token:
            return _redirect_to_login_with_error("ID token not returned by Cognito")
        claims = verify_id_token(id_token)
    except requests.HTTPError as exc:
        status_code = exc.response.status_code if exc.response else "unknown"
        return _redirect_to_login_with_error(
            f"Authentication failed during token exchange (status: {status_code})"
        )
    except requests.RequestException:
        return _redirect_to_login_with_error(
            "Authentication failed while contacting Cognito. Please retry."
        )
    except TokenVerificationError as exc:
        return _redirect_to_login_with_error(f"Authentication failed: {exc}")
    except Exception:
        return _redirect_to_login_with_error(
            "Unexpected error occurred during authentication. Please try again."
        )

    session.permanent = True
    session["user"] = {
        "sub": claims.get("sub"),
        "email": claims.get("email"),
        "username": claims.get("cognito:username"),
    }
    session["tokens"] = {
        "id_token": id_token,
        "access_token": access_token,
    }

    session.pop("oauth_state", None)
    session.pop("oauth_state_issued_at", None)

    return redirect(FRONTEND_MYPAGE_URL)


@app.route("/mypage")
@login_required
def mypage():
    user = session.get("user", {})
    html = """
    <html>
      <head><title>My Page</title></head>
      <body>
        <h1>ログイン中です</h1>
        <p>ユーザーID: {{ sub }}</p>
        {% if email %}<p>メールアドレス: {{ email }}</p>{% endif %}
        {% if username %}<p>ユーザー名: {{ username }}</p>{% endif %}
        <p><a href="/auth/logout">ログアウト</a></p>
      </body>
    </html>
    """
    return render_template_string(
        html,
        sub=user.get("sub"),
        email=user.get("email"),
        username=user.get("username"),
    )


@app.route("/api/me")
def api_me():
    user = session.get("user")
    if not user:
        return jsonify({"message": "Unauthorized"}), 401
    return jsonify(
        {"sub": user.get("sub"), "email": user.get("email"), "username": user.get("username")}
    )


@app.route("/api/user/attributes", methods=["GET", "POST"])
@login_required
def api_user_attributes():
    tokens = session.get("tokens") or {}
    access_token = tokens.get("access_token")
    if not access_token:
        return jsonify({"message": "Access token not found"}), 401

    if request.method == "GET":
        try:
            data = _call_cognito(
                "AWSCognitoIdentityProviderService.GetUser",
                access_token,
                {},
            )
            attributes = _map_attributes(data.get("UserAttributes"))
            return jsonify({"username": data.get("Username"), "attributes": attributes})
        except Exception as exc:  # noqa: BLE001
            return jsonify({"message": str(exc)}), 500

    payload = request.get_json(silent=True) or {}
    attributes, error_message = _validate_update_payload(payload)

    if error_message:
        return jsonify({"message": error_message}), 400
    if not attributes:
        return jsonify({"message": "更新する属性がありません。"}), 400

    try:
        _call_cognito(
            "AWSCognitoIdentityProviderService.UpdateUserAttributes",
            access_token,
            {"UserAttributes": attributes},
        )
        return jsonify({"message": "ユーザー情報を更新しました。"})
    except Exception as exc:  # noqa: BLE001
        return jsonify({"message": str(exc)}), 500


@app.route("/auth/logout")
def logout():
    session.clear()
    params = {
        "client_id": COGNITO_CLIENT_ID,
        "logout_uri": COGNITO_LOGOUT_REDIRECT_URI,
    }
    return redirect(f"{COGNITO_DOMAIN}/logout?{urlencode(params)}")


@app.route("/healthz")
def health_check():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=os.environ.get("FLASK_ENV") != "production")
