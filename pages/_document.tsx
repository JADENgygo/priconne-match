import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="プリコネRのクラン検索ツール" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@JADENgygo" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="プリコネマッチ" />
        <meta property="og:description" content="プリコネRのクラン検索ツール" />
        <meta property="og:url" content="https://priconne-match.vercel.app" />
        <meta property="og:image" content="https://priconne-match.vercel.app/card.webp" />
        <link rel="icon" href="/peko.png" />
      </Head>
      <body>
        <script src="/script.js" async />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
