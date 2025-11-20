import os
import secrets
import time
from functools import wraps
from typing import Any, Dict
from urllib.parse import urlencode

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, render_template_string, request, session
from jose import jwt

load_dotenv()

app = Flask(__name__)
app.config.update(
    SECRET_KEY=os.environ.get("FLASK_SECRET_KEY", "change-me"),
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

if not all(
    [COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID, COGNITO_CLIENT_SECRET, COGNITO_DOMAIN]
):
    raise RuntimeError("Missing required Cognito configuration environment variables.")

ISSUER = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}"
JWKS_URL = f"{ISSUER}/.well-known/jwks.json"

_jwks_cache: Dict[str, Any] | None = None
_jwks_cache_time: float | None = None


class OAuthStateError(Exception):
    pass


class TokenVerificationError(Exception):
    pass


def login_required(view_func):
    @wraps(view_func)
    def wrapped(*args, **kwargs):
        if not session.get("user"):
            return redirect("/login")
        return view_func(*args, **kwargs)

    return wrapped


def get_jwks() -> Dict[str, Any]:
    global _jwks_cache, _jwks_cache_time
    now = time.time()
    if _jwks_cache and _jwks_cache_time and now - _jwks_cache_time < 3600:
        return _jwks_cache

    response = requests.get(JWKS_URL, timeout=5)
    response.raise_for_status()
    _jwks_cache = response.json()
    _jwks_cache_time = now
    return _jwks_cache


def verify_id_token(id_token: str) -> Dict[str, Any]:
    jwks = get_jwks()
    try:
        claims = jwt.decode(
            id_token,
            jwks,
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
        "scope": "openid email profile",
        "redirect_uri": COGNITO_REDIRECT_URI,
        "state": state,
    }
    return f"{COGNITO_DOMAIN}/oauth2/authorize?{urlencode(params)}"


def exchange_code_for_tokens(code: str) -> Dict[str, Any]:
    token_url = f"{COGNITO_DOMAIN}/oauth2/token"
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": COGNITO_REDIRECT_URI,
        "client_id": COGNITO_CLIENT_ID,
    }
    response = requests.post(
        token_url,
        data=data,
        auth=(COGNITO_CLIENT_ID, COGNITO_CLIENT_SECRET),
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


@app.route("/auth/login")
def login():
    state = secrets.token_urlsafe(24)
    session["oauth_state"] = state
    session["oauth_state_issued_at"] = time.time()
    authorize_url = build_authorize_url(state)
    return redirect(authorize_url)


@app.route("/auth/callback")
def auth_callback():
    error = request.args.get("error")
    if error:
        return f"Login failed: {error}", 400

    state = request.args.get("state")
    code = request.args.get("code")

    try:
        _validate_state(state)
    except OAuthStateError as exc:
        return str(exc), 400

    if not code:
        return "Authorization code is missing", 400

    try:
        token_response = exchange_code_for_tokens(code)
        id_token = token_response.get("id_token")
        if not id_token:
            return "ID token not returned by Cognito", 400
        claims = verify_id_token(id_token)
    except (requests.HTTPError, TokenVerificationError) as exc:
        return f"Authentication failed: {exc}", 400

    session.permanent = True
    session["user"] = {
        "sub": claims.get("sub"),
        "email": claims.get("email"),
        "username": claims.get("cognito:username"),
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
    return jsonify({"sub": user.get("sub"), "email": user.get("email"), "username": user.get("username")})


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
