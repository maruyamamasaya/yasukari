# Cognito ログイン基盤の構成とセットアップ

Amazon Cognito の認可コードフローに対応した Flask バックエンドと、Next.js フロントエンドの連携手順をまとめました。

## ディレクトリ

- `backend/app.py` … Cognito 連携とセッションを担う Flask アプリケーション
- `backend/requirements.txt` … バックエンドの依存ライブラリ
- `backend/.env.example` … 必要な環境変数のサンプル

## 必要な環境変数

`.env` を `backend/.env.example` を元に作成してください。

```bash
FLASK_SECRET_KEY=ランダムな長い文字列
COGNITO_REGION=ap-northeast-1
COGNITO_USER_POOL_ID=ap-northeast-1_7PderE9jo
COGNITO_CLIENT_ID=vicsspgv2q7mtn6m6os2n893j
COGNITO_CLIENT_SECRET=コンソールに表示されている値（環境変数でのみ設定）
COGNITO_DOMAIN=https://ap-northeast-17pdere9jo.auth.ap-northeast-1.amazoncognito.com
COGNITO_REDIRECT_URI=https://yasukaribike.com/auth/callback
COGNITO_LOGOUT_REDIRECT_URI=https://yasukaribike.com/
FRONTEND_MYPAGE_URL=https://yasukaribike.com/mypage
FRONTEND_LOGIN_URL=https://yasukaribike.com/login
```

## バックエンドの起動

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # 値を実際のものに置き換える
python app.py
```

ローカル開発では `http://localhost:5000` で Flask が動作します。Next.js 側から同一オリジンで叩く場合は、フロントの `.env.local` に `NEXT_PUBLIC_API_ORIGIN=http://localhost:5000` を設定してください。

## エンドポイント概要

- `GET /auth/login` … Hosted UI へリダイレクトし、state を発行
- `GET /auth/callback` … 認可コードをトークンに交換し、ID トークンの署名・audience・issuer を検証。セッションを発行して `/mypage` へリダイレクト
- `GET /api/me` … セッションがあればユーザー情報(JSON)を返却、なければ 401
- `GET /mypage` … セッション必須の簡易表示用ビュー
- `GET /auth/logout` … セッションを破棄し、Cognito の `/logout` へリダイレクト

## 本番デプロイ例（ALB + EC2）

- Next.js を静的または Node.js サーバーとしてデプロイし、`/auth/*` と `/api/me` を Flask にフォワードするよう ALB/Nginx でパスベースのルーティングを設定
- Flask は Gunicorn + systemd などで常駐させ、`unix:/run/flask.sock` もしくは `:5000` を Nginx の upstream に登録
- `SESSION_COOKIE_SECURE` 相当の設定のため、HTTPS 経由で配信すること
- Cognito のコールバック/ログアウト URL に `https://yasukaribike.com/auth/callback` と `https://yasukaribike.com/` を登録

## フロントエンド連携ポイント

- ヘッダーのログイン/ログアウトボタンは必ず `/auth/login` と `/auth/logout` を経由
- ログイン状態の判定は `/api/me` を `credentials: 'include'` で呼び出して実施
- マイページ（`/mypage`）は `/api/me` のレスポンスを用いて表示し、未ログイン時は `/login` へリダイレクト

この構成で、Cognito が管理するトークンをバックエンドで検証しつつ、サーバー側セッションでログイン状態を維持できます。

## 追加要件（共有用の短文）

追加要件：Google アカウントでのログイン対応（Cognito ユーザープールの IdP に Google を追加し、Hosted UI で通常ログインと Google ログインを並列表示、フロントはヘッダーなどに `/auth/login` と `/auth/login/google` ボタンを出し `/auth/login/google` で identity_provider=Google を付けた Cognito の `/oauth2/authorize` へリダイレクトさせ、どちらのログインも共通の `/auth/callback` でトークン検証とセッション作成を行う）。
