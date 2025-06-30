import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        {/* External styles and icons */}
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
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
