import type { NextPage } from 'next'
import { getApp } from 'firebase/app';
import { collection, getFirestore, doc, setDoc, getDocs, query, orderBy, limit, startAfter, DocumentData, QueryDocumentSnapshot, where } from "firebase/firestore";
import React, { ComponentType, useEffect, useReducer, useRef, useState } from 'react';
import dayjs from "dayjs";
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'next/router';
import { Loader } from "../components/loader";
import { order, tags } from "../lib/tag";
import { store, setClans } from "../lib/redux";
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { Modal } from 'react-bootstrap';

dayjs.extend(utc);
dayjs.extend(timezone);

// todo 小さい画像でも最大化したい
// todo ｄｂのタグの値修正(外部ツール)

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
      orderedTags.map(e => [e.label, e.values[0]])
    ) as {[key in keyof typeof order]: string}
  );
  const [filtered, setFiltered] = useState(false);
  const [targets, setTargets] = useState(Object.fromEntries(orderedTags.map(e => [e.label, false])));
  const [expanded, setExpanded] = useState(false);
  const [url, setUrl] = useState("");

  const changeTag = (event: React.ChangeEvent<HTMLSelectElement>, name: string) => {
    setTag({...tag, [name]: event.target.value});
  };

  const changeTargets = (event: React.ChangeEvent<HTMLInputElement>, name: string) => {
    setTargets({...targets, [name]: event.target.checked});
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
    const wheres = Object.keys(tag).filter(e => targets[e]).map(e => where("tag." + e, "==", tag[e as keyof typeof order]));
    if ((kind === "filter" || kind === "release") || state.last === null) {
      if (kind === "filter" || (kind !== "release" && filtered)) {
        q = query(col, where("closed", "==", !false), ...wheres, limit(size))
      }
      else {
        q = query(col, where("closed", "==", !false), limit(size))
      }
    }
    else {
      if (filtered) {
        q = query(col, where("closed", "==", !false), ...wheres, startAfter(state.last), limit(size))
      }
      else {
        q = query(col, where("closed", "==", !false), startAfter(state.last), limit(size))
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
    const list = snapshot.docs.map(e => e.data()).sort((a, b) => a.updated_at < b.updated_at ? 1 : -1);
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

    setTimeout(() => {
      const storage = sessionStorage;
      const scroll = storage.getItem('scroll');
      if (scroll) {
        window.scroll({top: parseInt(scroll), behavior: "smooth"});
      }
    }, 150);

    return () => window.removeEventListener("scroll", f);
  }, []);

  if (router.query.page && isNaN(parseInt(router.query.page as string))) {
    router.replace("/?page=0");
    return <Loader />;
  }

  return (
    <div className="container pt-3">
      <div className="row gx-1 gy-1 text-center">
        {
          orderedTags.map(e => (
            <div className="col col-6 col-sm-4 col-md-3 col-lg-2" key={e.name}>
              <div>
                <label>
                  <input className="form-check-input me-1" type="checkbox" checked={targets[e.label]} onChange={event => changeTargets(event, e.label)} />
                  { e.name }
                </label>
              </div>
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
                <div className="d-flex justify-content-center align-items-center h-100">
                  {
                    e.downloadUrls.every((e: string) => e === "") ? (
                      <div>NO IMAGE</div>
                    ) : (
                      <div>
                        <img className="img-fluid" src={e.downloadUrls.find((e: string) => e !== "")} onClick={() => {
                          setUrl(e.downloadUrls.find((e: string) => e !== ""));
                          setExpanded(true);
                        }} />
                      </div>
                    )
                  }
                </div>
              </div>
              <div className="col-12 col-sm-6 position-relative" onClick={() => {
                dispatch(setClans({list: state.list, last: state.last}));
                const storage = sessionStorage;
                storage.setItem('scroll', document.documentElement.scrollTop.toString());
                router.push({pathname: "/clan", query: {uid: e.userId}});
              }}>
                <div className="mb-3 fw-bold text-center">{ e.name.slice(0, 10) }</div>
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
                <div>{ e.description.length <= 100 ? e.description : (e.description.slice(0, 100) + "…")  }</div>
                <div className="text-end mt-3">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={(e) => {
                    e.stopPropagation();
                    window.scroll({top: 0, behavior: "smooth"});
                  }}>トップにスクロール</button>
                </div>
              </div>
            </React.Fragment>
          ))
        }
      </div>
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
  )
}

export default Home
