import type { NextPage } from "next";
import { Loader } from "../components/loader";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { collection, getFirestore, doc, setDoc, deleteDoc, getDoc, getDocs, query, orderBy, limit, startAfter, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { order, tags } from "../lib/tag";
import { Modal } from 'react-bootstrap';

const Clan: NextPage = () => {
  const [editable, setEditable] = useState(false);
  const [state, setState] = useState({} as any);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const f = async () => {
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

      const auth = getAuth();
      if (!auth.currentUser) {
        return;
      }
      setEditable(router.query.uid === auth.currentUser.uid);
    };
    f();
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
                <img className="img-fluid" src={e} onClick={() => {
                  setUrl(e);
                  setExpanded(true);
                }} />
              </div>
            ))
          }
        </div>
        <p style={{whiteSpace: "pre-wrap"}}>{ state.description }</p>
        { state.twitter !== "" && <p>Twitter: <a href={"https://twitter.com/" + state.twitter}>@{ state.twitter }</a></p> }
        { editable && <button className="btn btn-primary" onClick={() => router.push("/register")}>編集</button> }
        <Modal show={expanded} fullscreen={true} onHide={() => setExpanded(false)}>
          <Modal.Header closeButton onClick={() => setExpanded(false)}></Modal.Header>
          <Modal.Body className="m-0 p-0">
            <div className="d-flex justify-content-center align-items-center h-100" onClick={(e) => {
              if (e.target === e.currentTarget) {
                setExpanded(false);
              }
            }}>
              <div>
                <img className="img-fluid" src={url} />
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    ) : <Loader />
  )
};

export default Clan;
