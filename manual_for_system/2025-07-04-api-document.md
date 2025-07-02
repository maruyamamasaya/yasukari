---
title: "APIドキュメント"
date: "2025-07-04"
---

# APIドキュメント (2025/07/04)

システムエンジニア・管理者向けに提供する API の概要をまとめます。現在のサイト更新ブログや認証関連で利用可能なエンドポイントを記載しました。

## 認証

- `/api/login` に `POST` すると、`username` と `password` を用いた簡易認証を行います。成功すると `auth` Cookie が 1 日間有効で付与されます。
- `/api/signup` では新規ユーザー登録を受け付けます。こちらも `POST` で `username` と `password` を送信します。
- 誤ったログインが続くと `/api/unblock` で解除できる一時ブロックが発生します。

## 更新ブログ API

サイト更新ブログの記事を取得・管理するための想定 API です。

- `GET /api/manual/posts` – 記事一覧を取得します。クエリ `page` でページ番号を指定できます。
- `GET /api/manual/posts/[slug]` – 個別記事の詳細を取得します。
- `POST /api/manual/posts` – 新規記事を作成します。認証が必要です。
- `PUT /api/manual/posts/[slug]` – 既存記事を更新します。認証が必要です。
- `DELETE /api/manual/posts/[slug]` – 記事を削除します。認証が必要です。

レスポンスは JSON 形式で、記事本文は Markdown テキストを扱う想定です。将来的に管理画面からこれらの API を呼び出して更新できるよう拡張していきます。
