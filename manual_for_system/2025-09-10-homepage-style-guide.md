---
title: "トップページCSSスタイルガイド"
date: "2025-09-10"
---

# トップページCSSスタイルガイド

サイトのデザインを統一するため、`pages/index.tsx` に登場する各セクションの役割とスタイルのポイントをまとめます。グローバルスタイルは `styles/global.css` に定義されているため、ここでは要素ごとの特徴を簡潔に記載します。

## 1. ヒーロースライダー

- `HeroSlider` コンポーネントで画面幅いっぱいの画像をスライド表示
- Swiper の `.swiper`, `.swiper-slide` クラスを使用しナビゲーションはブランドカラー
- 画像は `object-cover` で中央寄せし、余白は `py-0`

## 2. 注目キーワード

- セクション全体は `py-6 px-4`
- キーワードリンクは `inline-flex` でアイコンと文字を横並びにし、`rounded-full` と `shadow-sm` を適用
- ホバー時はリンク色を `var(--primary-color)` にして強調

## 3. 特徴紹介グリッド

- `FeatureItem` を3列(モバイルは1列)で配置
- 各項目は `bg-white rounded shadow-sm p-4`
- アイコン部分に `text-primary` を使いブランドカラーを統一

## 4. 新着ブログカルーセル

- Swiper で自動スライド、`.blog-slide` クラスにより画像比率とホバーアニメーションを指定
- タイトル部は `.blog-slide-title` で半透明の黒背景＋白文字

## 5. 最近チェックした商品

- `RecentlyViewed` コンポーネントを挿入
- `localStorage` から取得した閲覧履歴をリスト表示し、カードは `bike-lineup-card` と同じスタイル

## 6. バイクラインアップ

- `BikeLineup` コンポーネントでカテゴリ別の車両を横スクロール表示
- ラジオボタンは `.bike-lineup-radio` を使用し、チェック時は `var(--primary-color)` でハイライト

## 7. 人気の型番カルーセル

- `BikeModelCarousel` コンポーネントを利用
- 画像サイズは 220px で統一し、初期表示で `fadeInUp` アニメーションを実行

## 8. ジャンル別おすすめ

- `GenreCarousel` でバイクのジャンルをカード形式で紹介
- カード幅は一定で、アイコン表示時は中央揃え

## 9. 店舗選択セクション

- 2カラムのカードを並べ、`border` と `shadow-sm` で枠線と影を付ける
- 画像は `object-cover`、下部に店名と説明文を配置

## 10. 使い方ガイド

- `HowToUse` コンポーネントでステップを3つ表示
- `.howto-img`, `.howto-title`, `.howto-desc` クラスで画像サイズとテキスト余白を調整

## 11. FAQセクション

- `FaqAccordion` を用いてよくある質問をアコーディオン形式で展開
- `.faq-accordion` と `.faq-answer` で枠線や開閉アニメーションを制御

以上の各セクションを組み合わせることで、トップページのデザインを統一的に構築できます。ブランドカラーや基本スタイルは `global.css` の変数とクラスを利用し、必要に応じてTailwind CSSのユーティリティクラスを併用してください。

