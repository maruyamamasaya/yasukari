import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        {/* External styles and icons */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="robots" content="noindex,nofollow" />
        {/* Tailwind CSS */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
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
