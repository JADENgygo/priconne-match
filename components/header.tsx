import { Nav, Navbar, Container } from "react-bootstrap";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";

export const Header = () => {
  const router = useRouter();
  const auth = getAuth();

  const [authenticated, setAuthenticated] = useState(false);
  useEffect(() => {
    setAuthenticated(auth.currentUser !== null);
  });

  const logOut = async () => {
    await fetch("/api/signout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    router.reload();
  };

  return (
    <Navbar
      collapseOnSelect
      expand="sm"
      bg="black"
      className="bg-gradient pt-3 pb-3"
      variant="dark"
    >
      <Container>
        <Navbar.Brand className="fs-3">
          <Link href="/">
            <a className="link-light link">プリコネマッチ</a>
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto">
            <div className="text-nowrap text-white row gx-3 gy-3">
              <div className="col-12 col-sm pt-3 pt-sm-0">
                <Link href="/">
                  <a className="link-light link">ホーム</a>
                </Link>
              </div>
              {authenticated && (
                <>
                  <div className="col-12 col-sm">
                    <Link href="/register">
                      <a className="link-light link">クラン登録</a>
                    </Link>
                  </div>
                  <div className="col-12 col-sm" id="delete">
                    <Link href="/delete">
                      <a className="link-light link">アカウント削除</a>
                    </Link>
                  </div>
                </>
              )}
              <div className="col-12 col-sm">
                {authenticated ? (
                  <div className="link-light link" onClick={logOut} id="logout">
                    ログアウト
                  </div>
                ) : (
                  <div id="login">
                    <Link href="/signin">
                      <a className="link-light link">新規登録/ログイン</a>
                    </Link>
                  </div>
                )}
              </div>
              {authenticated && (
                <div className="col-12 col-sm">
                  @{(auth.currentUser as any)?.reloadUserInfo?.screenName}
                </div>
              )}
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
