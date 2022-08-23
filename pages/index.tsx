import type { NextPage } from 'next'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { getApp } from 'firebase/app';
import { collection, getFirestore, doc, setDoc, getDocs, query, orderBy, limit, startAfter, DocumentData, QueryDocumentSnapshot, where } from "firebase/firestore";
import React, { ComponentType, useEffect, useReducer, useRef, useState } from 'react';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import dayjs from "dayjs";
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Loader } from "../components/loader";
import { order, tags } from "../lib/tag";
import { Provider } from 'react-redux';
import { store, setClans } from "../lib/redux";
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

dayjs.extend(utc);
dayjs.extend(timezone);

// todo noimageを実装

const Home: NextPage = () => {
  const dispatch = useDispatch();
  const selector = useSelector((state: any) => state.clans);
  const router = useRouter();
  const [readable, setReadable] = useState(true);
  const [state, setState] = useState({
    last: null as (QueryDocumentSnapshot<DocumentData> | null),
    list: [] as DocumentData[],
  });
  const orderedTags = tags.sort((a, b) => order[a.label as keyof typeof order] - order[b.label as keyof typeof order]);
  const [tag, setTag] = useState(
    Object.fromEntries(
      orderedTags.map((e, i) => [e.label, e.values[0]])
    ) as {[key in keyof typeof order]: string}
  );
  const [filtered, setFiltered] = useState(false);

  const changeTag = (event: React.ChangeEvent<HTMLSelectElement>, name: string) => {
    setTag({...tag, [name]: event.target.value});
  };

  const search = async (kind: "normal" | "filter" | "release" = "normal") => {
    if (kind !== "filter" && kind !== "release" && !readable) {
      return;
    }
    console.info('search');
    const app = getApp();
    const db = getFirestore(app);
    const col = collection(db, "clans");
    let q;
    const size = 5;
    const wheres = Object.keys(tag).map(e => where("tag." + e, "==", tag[e as keyof typeof order]));
    if ((kind === "filter" || kind === "release") || state.last === null) {
      if (kind === "filter" || (kind !== "release" && filtered)) {
        console.log('a', tag)
        q = query(col, where("closed", "==", false), ...wheres, orderBy("updated_at", "desc"), limit(size))
      }
      else {
        console.log('b', tag)
        q = query(col, where("closed", "==", false), orderBy("updated_at", "desc"), limit(size))
      }
    }
    else {
      if (filtered) {
        console.log('c', tag)
        q = query(col, where("closed", "==", false), ...wheres, orderBy("updated_at", "desc"), startAfter(state.last), limit(size))
      }
      else {
        console.log('d', tag)
        q = query(col, where("closed", "==", false), orderBy("updated_at", "desc"), startAfter(state.last), limit(size))
      }
    }
    const snapshot = await getDocs(q);
    if (snapshot.size === 0) {
      setReadable(false);
      if (kind === "filter" || kind === "release") {
        setState({last: null, list: []});
      }
      return;
    }
    const list = snapshot.docs.map(e => e.data());
    if (kind  === "filter" || kind === "release") {
      setReadable(true);
      setFiltered(kind === "filter");
      setState({last: snapshot.docs[snapshot.size - 1], list: list});
    }
    else {
      setState({last: snapshot.docs[snapshot.size - 1], list: state.list.concat(list)});
    }
  };

  const callbackRef = useRef(search);
  useEffect(() => {
    callbackRef.current = search;
  }, [search]);

  useEffect(() => {
    if (selector.list.length === 0) {
      search();
    }
    else {
      setState({last: selector.last, list: selector.list});
    }
    const f = () => {
      if (document.documentElement.scrollHeight <= document.documentElement.clientHeight + document.documentElement.scrollTop) {
        callbackRef.current();
      }
    };
    window.addEventListener('scroll', f);
    return () => window.removeEventListener("scroll", f);
  }, []);

  if (router.query.page && isNaN(parseInt(router.query.page as string))) {
    router.replace("/?page=0");
    return <Loader />;
  }

  // const debug = async () => {
  //   const app = getApp();
  //   const db = getFirestore(app);

  //   for (let i = 0; i < 100; ++i) {
  //     const now = dayjs().tz("Asia/Tokyo"). format('YYYY-MM-DDTHH:mm:ss.SSS+09:00');
  //     await setDoc(doc(db, "clans", "test" + i), {
  //       closed: true,
  //       created_at: now,
  //       description: "description" + i,
  //       downloadUrls: ["https://firebasestorage.googleapis.com/v0/b/princess-connect-clan-searcher.appspot.com/o/test%2Ftest0.jpg?alt=media&token=4153f5c1-b61e-4ea9-a82a-0240464b8070", null, null, null],
  //       name: "test" + i,
  //       screenName: "screenName" + i,
  //       tag: {
  //         'rank': "test",
  //         'policy': "test",
  //         'login': "test",
  //         'chat': "test",
  //         'tool': "test",
  //         'battleCount': "test",
  //         'auto': "test",
  //         'equipmentRequest': "test",
  //         'battleDeclaration': "test",
  //         'level': "test",
  //         'strength': "test",
  //         'character': "test",
  //       },
  //       updated_at: now,
  //       userId: "testid" + i
  //     });
  //   }
  //   console.log("done")
  // };

  return (
    <div className="container pt-3">
      <div className="row gx-1 gy-1 text-center">
        {
          tags.sort((a, b) => order[a.label as keyof typeof order] - order[b.label as keyof typeof order]).map(e => (
            <div className="col col-6 col-sm-4 col-md-3 col-lg-2" key={e.name}>
              <div>{ e.name }</div>
              <select value={tag[e.label as keyof typeof order]} onChange={event => changeTag(event, e.label)} className="form-select form-select-sm">
                {
                  e.values.map(e_ => (
                    <option value={e_} key={e_}>{ e_ }</option>
                  ))
                }
              </select>
            </div>
          ))
        }
      </div>
      <button type="button" className="btn btn-primary mt-3 me-3" onClick={() => search("filter")}>絞り込み</button>
      <button type="button" className="btn btn-primary mt-3" onClick={() => search("release")}>解除</button>
      <div className="row gy-3 mt-3">
        {
          state.list.map(e => (
            <React.Fragment key={e.userId}>
              <hr />
              <div className="col-12 col-sm-6" id={e.userId}>
                <img className="img-fluid" src={e.downloadUrls.find((e: string) => e !== "") ?? ""} />
              </div>
              <div className="col-12 col-sm-6" onClick={() => {
                dispatch(setClans({list: state.list, last: state.last}));
                router.push({pathname: "/clan", query: {uid: e.userId}});
              }}>
                <div className="mb-3 fw-bold text-center">{ e.name }</div>
                <div className="row row-cols-auto gx-1 mb-3">
                  {
                    (Object.keys(e.tag) as (keyof typeof order)[])
                      .sort((a: keyof typeof order, b: keyof typeof order) => order[a] - order[b])
                      .map((e_: keyof typeof order) => (
                        <div className="col" key={e_}>
                          <span key={e_} className="badge bg-info text-dark">{ e.tag[e_] }</span>
                        </div>
                      ))
                  }
                </div>
                <div>{ e.description }</div>
              </div>
            </React.Fragment>
          ))
        }
      </div>
      {/* <button className="btn btn-primary" onClick={debug}>テストデータ作成</button> */}
    </div>
  )
}

export default Home
