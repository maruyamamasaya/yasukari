---
title: "開発状況サマリ"
date: "2025-06-30"
---

# 開発状況サマリ (2025/06/30)

現在のサイト構築内容を整理しました。今後の方針検討のためのメモです。

## 実装済み機能

- Next.js + TypeScript によるアプリ基盤をセットアップ済み
- トップページでは Hero セクション、ブログカルーセル、BikeModelCarousel など UI を強化
- チャットボット (`ChatBot.tsx`) は FAQ データ `data/faq.json` を読み込み、カテゴリ選択〜自由入力モードを試験実装
- ChatBotWidget を追加しページ右下から開閉可能に
- Manual for System ディレクトリを読み込み、Markdown 記事を一覧表示する `/manual_for_system` ページを構築
- CalendarWidget や DirectoryTree コンポーネントで開発日誌の参照性を向上
- Footer コンポーネント、グローバル CSS を整備し全体のデザインを統一

## ページ構成

- `/` … トップページ。キャンペーン告知バー、検索バー、各種コンテンツのカルーセルを表示
- `/chat` … チャットサポートページ。将来的に OpenAI API 連携予定
- `/products` … 車種一覧ページのプレースホルダー
- `/manual_for_system` … 更新ブログ一覧。Markdown ファイルを静的変換
- `/manual_for_system/[slug]` … 各ブログ記事表示

## リソース・素材の状況

- 画像・アイコンは現状 `react-icons` とデモ用画像のみ。専用アセットは未整備
- CSS は `styles/global.css` のみで、Tailwind などのユーティリティは未導入
- データは `data/faq.json` のみで、外部 API 連携はこれから検討

## 今後の予定

- ブログ記事や各車種の詳細コンテンツを順次追加
- チャットボットの回答精度向上と OpenAI API 連携の検証
- 画像アセットやビルド設定の整理、公開用ドメインへのデプロイ準備

