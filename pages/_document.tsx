import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        {/* External styles and icons */}
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://fastly.rentio.jp/packs/fa/css/fontawesome.min-6.7.2.css" media="all" />
        <link rel="stylesheet" href="https://fastly.rentio.jp/packs/fa/css/brands.min-6.7.2.css" media="all" />
        <link rel="stylesheet" href="https://fastly.rentio.jp/packs/fa/css/regular.min-6.7.2.css" media="all" />
        <link rel="stylesheet" href="https://fastly.rentio.jp/packs/fa/css/solid.min-6.7.2.css" media="all" />
        <link rel="stylesheet" href="https://fastly.rentio.jp/packs/pc-86074705eb2658730cdd.css" media="screen" />
        {/* Animate.css - http://daneden.me/animate */}
        {/* Licensed under the MIT license - http://opensource.org/licenses/MIT */}
        {/* Copyright (c) 2015 Daniel Eden */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css" />
        {/* Tailwind CSS CDN for utility classes */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.4/dist/tailwind.min.css"
        />
        {/* Swiper styles for carousels */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/swiper@10/swiper-bundle.min.css"
        />
        <script dangerouslySetInnerHTML={{ __html: "var RentioApp = { env: 'production' };" }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
