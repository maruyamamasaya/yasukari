export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <script src="https://applepay.cdn-apple.com/jsapi/v1/apple-pay-sdk.js" />
      </head>
      <body>
        {children}
        <div id="payjp-root" />
      </body>
    </html>
  );
}
