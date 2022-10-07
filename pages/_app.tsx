import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import '../styles/globals.scss';
import type { AppProps } from 'next/app'
import Head from "next/head"
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { initializeApp } from "firebase/app";
import { User, onAuthStateChanged, getAuth, getRedirectResult } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { Header } from "../components/header";
import { Loader } from "../components/loader";
import { Provider } from 'react-redux';
import { store, setClans } from "../lib/redux";

function MyApp({ Component, pageProps }: AppProps) {
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();
  const ref = useRef(false);

  useEffect(() => {
    if (ref.current) {
      return;
    }
    ref.current = true;

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
      databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
    };
    const app = initializeApp(firebaseConfig);
    getAnalytics(app);

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      const credential = await getRedirectResult(auth).catch((error) =>
        console.error(error),
      );
      if (credential) {
        const id = await credential.user.getIdToken();
        await fetch("/api/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ session: id }),
        });
        router.reload(); // push(replace)にしてsetLoadedすると一瞬サインイン画面が見えてしまう
        return;
      }
      setLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="content">
      <Head>
        <title>プリコネマッチ</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>
      { loaded ? (
          <>
            <Header />
            <Provider store={store}>
              <Component {...pageProps} />
            </Provider>
          </>
        ) : <Loader />
      }
      <footer className="text-center pt-3 pb-3" >
        <div>
          <a href="https://twitter.com/@JADENgygo" className="me-3" >
            <i className="bi bi-twitter"></i>
          </a>
          <a href="https://priconne-portfolio.vercel.app" className="link" >
            闇プリン開発室
          </a>
        </div>
        <div>一部画像 &copy; Cygames, Inc.</div>
      </footer>
    </div>
  );
}

export default MyApp
