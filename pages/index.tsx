import type { NextPage } from 'next'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { getApp } from 'firebase/app';
import { collection, getFirestore, doc, setDoc, getDocs, query, orderBy, limit, startAfter, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import React, { ComponentType, useEffect, useRef, useState } from 'react';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import dayjs from "dayjs";
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Loader } from "../components/loader";
import { order } from "../lib/tag";

dayjs.extend(utc);
dayjs.extend(timezone);

const Home: NextPage = () => {
  const router = useRouter();
  const [state, setState] = useState({
    last: (null as unknown) as QueryDocumentSnapshot<DocumentData>,
    list: [] as DocumentData[],
  });

  const search = async () => {
    const app = getApp();
    const db = getFirestore(app);
    const col = collection(db, "clans");
    let q;
    const size = 5;
    if (state.last === null) {
      q = query(col, orderBy("updated_at", "desc"), limit(size))
    }
    else {
      q = query(col, orderBy("updated_at", "desc"), startAfter(state.last), limit(size))
    }
    const snapshot = await getDocs(q);
    if (snapshot.size === 0) {
      return;
    }
    const list = snapshot.docs.map(e => e.data());
    setState({last: snapshot.docs[snapshot.size - 1], list: state.list.concat(list)});
  };

  const callbackRef = useRef(search);
  useEffect(() => {
    callbackRef.current = search;
  }, [search]);

  useEffect(() => {
    search();
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

  const debug = async () => {
    const app = getApp();
    const db = getFirestore(app);

    for (let i = 0; i < 100; ++i) {
      const now = dayjs().tz("Asia/Tokyo"). format('YYYY-MM-DDTHH:mm:ss.SSS+09:00');
      await setDoc(doc(db, "clans", "test" + i), {
        closed: true,
        created_at: now,
        description: "description" + i,
        downloadUrls: ["https://firebasestorage.googleapis.com/v0/b/princess-connect-clan-searcher.appspot.com/o/test%2Ftest0.jpg?alt=media&token=4153f5c1-b61e-4ea9-a82a-0240464b8070", null, null, null],
        name: "test" + i,
        screenName: "screenName" + i,
        tag: {
          'rank': "test",
          'policy': "test",
          'login': "test",
          'chat': "test",
          'tool': "test",
          'battleCount': "test",
          'auto': "test",
          'equipmentRequest': "test",
          'battleDeclaration': "test",
          'level': "test",
          'strength': "test",
          'character': "test",
        },
        updated_at: now,
        userId: "testid" + i
      });
    }
    console.log("done")
  };

  const current = router.query.page ? parseInt(router.query.page as string) : 0;
  let left = 0;
  let center = 0;
  let right = 0;
  switch(current % 3) {
    case 0:
      left = current;
      center = current + 1;
      right = current + 2;
      break;
    case 1:
      left = current - 1;
      center = current;
      right = current + 1;
      break;
    case 2:
      left = current - 2;
      center = current - 1;
      right = current;
      break;
  }
  return (
    <div className="container pt-3">
      <div className="row gy-3">
        {
          state.list.map(e => (
            <React.Fragment key={e.userId}>
              <div className="col-12 col-sm-6">
                <img className="img-fluid" src={e.downloadUrls[0]} />
              </div>
              <div className="col-12 col-sm-6">
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

      <button className="btn btn-primary" onClick={debug}>テストデータ作成</button>
    </div>
  )
}

export default Home
