---
title: "認証機能設計メモ"
date: "2025-09-03"
---

# 認証機能設計メモ (2025/09/03)

Google、Apple、メールアドレスを用いたログインを AWS Cognito と連携して実装する予定です。ここではその概要をまとめます。

## 目標

- Cognito ユーザープールを利用し、ソーシャルログインとメール認証を統合する
- Next.js から各種認証処理を呼び出せる API ルートを整備する

## 実装方針

1. **Cognito ユーザープールの作成**
   - 管理画面からユーザープールを新規作成し、ドメインを設定します。
2. **外部 IdP の登録**
   - Google と Apple を Identity Provider として追加し、クライアント ID やシークレットを登録します。
   - リダイレクト URL は `https://<your-domain>/api/auth/callback` を指定します。
3. **アプリクライアント設定**
   - ユーザープールのアプリクライアントで OAuth 2.0 を有効化し、上記 IdP を紐付けます。
4. **Next.js からの連携**
   - `amazon-cognito-identity-js` もしくは AWS Amplify を用いてサインイン処理を実装します。
   - Google / Apple ボタンでは Cognito Hosted UI へリダイレクトし、メール認証は API 経由でサインインします。
5. **API ルート例**
   - `/api/auth/login` – メールアドレスとパスワードを受け取り、Cognito へ認証リクエストを送信。
   - `/api/auth/logout` – リフレッシュトークンの無効化と Cookie の削除を行う。
6. **セッション管理**
   - 取得したトークンは HTTP Only Cookie に保存し、必要に応じてリフレッシュ処理を追加します。

後続の実装では、上記手順に沿って API や画面を整備していきます。まずは `/login` ページの UI のみ用意し、認証ロジックは追って組み込みます。
