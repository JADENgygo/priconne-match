import type { NextPage } from "next";
import { Loader } from "../components/loader";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { collection, getFirestore, doc, setDoc, deleteDoc, getDoc, getDocs, query, orderBy, limit, startAfter, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { order, tags } from "../lib/tag";
import Link from "next/link";

const Clan: NextPage = () => {
  const [editable, setEditable] = useState(false);
  const [state, setState] = useState({} as any);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const f = async () => {
      const auth = getAuth();
      if (!auth.currentUser) {
        return;
      }
      const app = getApp();
      const db = getFirestore(app);
      const docRef = doc(db, "clans", router.query.uid as string);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return;
      }
      const data = docSnap.data();
      setState({name: data.name, description: data.description, twitter: data.screenName, tag: data.tag, downloadUrls: data.downloadUrls});
      setLoaded(true);

      setEditable(router.query.uid === auth.currentUser.uid);
    };
    f();

    // window.onpopstate = (e) => {
    //   console.log('popstate')
    //   history.pushState(null, "", location.origin + "#" + router.query.uid as string);
    //   // history.go(1);
    //   // e.stopPropagation();
    //   // location.href += "#" + router.query.uid as string;
    //   // console.log(location.href)
    //   // console.log(e)
    // }
  }, []);

  const router = useRouter();
  if (!router.query.uid) {
    router.replace("/");
    return <Loader />;
  }

  return (
    loaded ? (
      <div className="container mt-3">
        <p className="fw-bold">{ state.name }</p>
        <div className="row row-cols-auto gx-1 gy-0 mb-3">
          {
            Object.keys(state.tag).sort((a: string, b: string) => order[a as keyof typeof order] - order[b as keyof typeof order]).map((e: string) => (
              <div className="col" key={e}>
                <span className="badge bg-info text-dark">{ state.tag[e] }</span>
              </div>
            ))
          }
        </div>
        <div className="row gx-3 gy-3 mb-3">
          {
            state.downloadUrls.filter((e: string) => e !== "").map((e: string, i: number) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={i}>
                <img className="img-fluid" src={e} />
              </div>
            ))
          }
        </div>
        <p>{ state.description }</p>
        { state.twitter !== "" && <p>Twitter: <a href={"https://twitter.com/" + state.twitter}>@{ state.twitter }</a></p> }
        { editable && <button className="btn btn-primary" onClick={() => router.push("/register")}>編集</button> }
      </div>
    ) : <Loader />
  )
};

export default Clan;
