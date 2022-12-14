import { Nav, Navbar, Container } from "react-bootstrap";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";
import { Loader } from "./loader";
import { parseCookies, setCookie } from "nookies";

export const Header = () => {
  const [loaded, setLoaded] = useState(true);
  const [theme, setTheme] = useState<"" | "light" | "dark">("");
  const router = useRouter();

  const auth = getAuth();

  const [authenticated, setAuthenticated] = useState(false);
  useEffect(() => {
    setAuthenticated(auth.currentUser !== null);
  });

  useEffect(() => {
    const cookie = parseCookies();
    setTheme(cookie.theme === "dark" ? "dark" : "light");
  }, [])

  const changeTheme = () => {
    const cookie = parseCookies();
    setCookie(null, "theme", cookie.theme === "dark" ? "light" : "dark", {
      maxAge: 60 * 60 * 24 * 30 * 12 * 1,
      path: "/"
    });
    router.reload();
  };

  const logOut = async () => {
    setLoaded(false);
    await fetch("/api/signout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    router.reload();
  };

  if (!loaded) {
    return <Loader />;
  }

  return (
    <Navbar
      collapseOnSelect
      expand="md"
      className="pt-3 pb-3"
      variant={theme}
    >
      <Container>
        <Navbar.Brand className="fs-3">
          <Link href="/">
            <a className="title fw-bold">プリコネマッチ</a>
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav>
            <div className="text-nowrap row row-cols-auto">
              <div className="col">
                <Nav.Link href="#" className="active link" onClick={() => router.push("/")}>ホーム</Nav.Link>
              </div>
              {authenticated && (
                <>
                  <div className="col">
                    <Nav.Link href="#" className="active link" onClick={() => router.push("/register")}>クラン登録</Nav.Link>
                  </div>
                  <div className="col" id="delete">
                    <Nav.Link href="#" className="active link" onClick={() => router.push("/delete")}>アカウント削除</Nav.Link>
                  </div>
                </>
              )}
              <div className="col">
                {authenticated ? (
                  <Nav.Link href="#" className="active link" onClick={logOut}>ログアウト</Nav.Link>
                ) : (
                  <div id="login">
                    <Nav.Link href="#" className="active link" onClick={() => router.push("/signin")}>新規登録/ログイン</Nav.Link>
                  </div>
                )}
              </div>
              <div className="col">
                <Nav.Link href="#" className="active link" onClick={changeTheme}>ダークモード: {theme === "light" ? "オフ": "オン"}</Nav.Link>
              </div>
              {authenticated && (
                <div className="col">
                  {/* 位置をそろえるためにNav.Linkにしている */}
                  <Nav.Link href="#" className="active">@{(auth.currentUser as any)?.reloadUserInfo?.screenName}</Nav.Link>
                </div>
              )}
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
