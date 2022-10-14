import { Html, Head, Main, NextScript } from "next/document";
import Document, { DocumentContext, DocumentInitialProps } from 'next/document'
import nookies from "nookies";

class MyDocument extends Document {
  static theme: string = "";

  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const cookie = nookies.get(ctx);
    MyDocument.theme = cookie.theme === "dark" ? "dark" : "light";
    nookies.set(ctx, "theme", MyDocument.theme, {
      maxAge: 60 * 60 * 24 * 30 * 12 * 1,
      path: "/"
    });
    const initialProps = await Document.getInitialProps(ctx);
    return initialProps;
  }

  render() {
    return (
      <Html className={MyDocument.theme}>
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
        <body className={MyDocument.theme}>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
