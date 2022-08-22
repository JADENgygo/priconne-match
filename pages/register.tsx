import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import nookies from "nookies";
import { GetServerSideProps } from "next";
import { Accordion, Dropdown, DropdownButton, Form } from "react-bootstrap";
import { order, tags } from "../lib/tag";
import { getApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { collection, getFirestore, doc, setDoc, deleteDoc, getDoc, getDocs, query, orderBy, limit, startAfter, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { initFirebaseAdminApp } from "../lib/firebase-admin";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { useRouter } from "next/router";
import { Loader } from "../components/loader";

dayjs.extend(utc);
dayjs.extend(timezone);

const Register: NextPage = () => {
  const [confirmed, setConfirmed] = useState(false);
  const [validated, setValidated] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [deletable, setDeletable] = useState(false);
  const [tag, setTag] = useState(
    Object.fromEntries(
      Object.keys({...order}).
        sort((a, b) => order[a as keyof typeof order] - order[b as keyof typeof order]).
        map((e, i) => [
          e,
          tags.sort((a, b) => order[a.label as keyof typeof order] - order[b.label as keyof typeof order])[i].values[0]
        ])
    ) as {[key in keyof typeof order]: string}
  );
  const [images, setImages] = useState([
    {
      src: "",
      data: null as any,
    },
    {
      src: "",
      data: null as any,
    },
    {
      src: "",
      data: null as any,
    },
    {
      src: "",
      data: null as any,
    },
  ]);
  const [info, setInfo] = useState({
    name: "",
    description: "",
    twitter: "",
    private: false,
  });
  const router = useRouter();

  useEffect(() => {
    const f = async () => {
      const auth = getAuth();
      if (!auth.currentUser) {
        return;
      }
      const app = getApp();
      const db = getFirestore(app);
      const docRef = doc(db, "clans", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setInfo({name: data.name, description: data.description, twitter: data.screenName, private: data.closed});
        setTag({...data.tag});
        setImages(data.downloadUrls.map((e: string) => ({src: e, data: null})));
        setDeletable(true);
      }
    };
    f();
  }, []);

  if (loaded) {
    return <Loader />
  }

  const debug = () => {
    console.log(info, tag, images);
  };

  const changeTag = (event: React.ChangeEvent<HTMLSelectElement>, name: string) => {
    setTag({...tag, [name]: event.target.value});
  };

  const changeInfo = (event: React.ChangeEvent<any>, name: string) => {
    setInfo({...info, [name]: (name === "private" ? event.target.checked : event.target.value)});
  };

	const selectImage = async (event: any, index: number): Promise<void> => {
		// 一度ダイアログで画像を選択した後に、もう一度ダイアログを開いてキャンセルすると本関数が呼ばれるがevent.target.files[0]がundefinedになるため
		if (!event.target.files[0]) {
      setImages(pre => {
        pre[index].src = "";
        pre[index].data = null;
        return [...pre];
      });
			return;
		}
		const reader = new FileReader();
		reader.readAsArrayBuffer(event.target.files[0]);
		const validated = await new Promise(resolve => {
			reader.onload = (e: ProgressEvent<FileReader>): void => {
				const data = new Uint8Array(e.target?.result as ArrayBufferLike).subarray(0, 12);
				let header = '';
				for (let i = 0; i < data.length; ++i) {
					header += data[i].toString(16);
				}
				// jpg
				resolve(/^ffd8ff/.test(header));
			};
		});

		if (!validated) {
      setImages(pre => {
        pre[index].src = "";
        pre[index].data = null;
        return [...pre];
      });
			return;
		}

		const r = new FileReader();
		r.readAsDataURL(event.target.files[0]);
		await new Promise(resolve => {
			r.onload = () => {
        setImages(pre => {
          pre[index].src = r.result as any;
          pre[index].data = event.target.files[0]
          return [...pre];
        });
				resolve(true);
			};
		});
	};

  const register = async (event: React.FormEvent<HTMLFormElement>) => {
    event.stopPropagation();
    event.preventDefault();
    if (info.name === "") {
      setValidated(true);
      return;
    }

    const auth = getAuth();
    if (!auth.currentUser) {
      return;
    }

    setLoaded(true);

    const urls = images.map(e => e.src);
    for (let i = 0; i < images.length; ++i) {
      const storage = getStorage();
      const reference = ref(storage, `${auth.currentUser.uid}/profile${i}.jpg`);
      // dataがnullでsrcに正しい値が入っている場合がある (登録後の再修正の時)
      if (images[i].src === "") {
        try {
          await deleteObject(reference);
        }
        catch (e) {
          // ファイルがない場合 (なにもしない)
        }
      }
      else if (images[i].data !== null) {
        await uploadBytes(reference, images[i].data);
        const url = await getDownloadURL(reference);
        urls[i] = url;
      }
    }

    const app = getApp();
    const db = getFirestore(app);
    const now = dayjs().tz("Asia/Tokyo"). format('YYYY-MM-DDTHH:mm:ss.SSS+09:00');
    await setDoc(doc(db, "clans", auth.currentUser.uid), {
      closed: info.private,
      created_at: now,
      description: info.description,
      downloadUrls: urls,
      name: info.name,
      screenName: info.twitter,
      tag: tag,
      updated_at: now,
      userId: auth.currentUser.uid,
    });
    router.push("/");
  };

  const removeImage = (index: number) => {
    setImages(pre => {
      pre[index].src = "";
      pre[index].data = null;
      return [...pre];
    });
    const image = document.getElementById('image' + index) as HTMLInputElement;
    if (!image) {
      return;
    }
    image.value = "";
  };

  const deleteClan = async () => {
    const auth = getAuth();
    if (!auth.currentUser) {
      return;
    }

    setLoaded(true);

    const app = getApp();
    const db = getFirestore(app);
    const docRef = doc(db, "clans", auth.currentUser.uid);
    await deleteDoc(docRef);

    for (let i = 0; i < images.length; ++i) {
      const storage = getStorage();
      const reference = ref(storage, `${auth.currentUser.uid}/profile${i}.jpg`);
      try {
        await deleteObject(reference);
      }
      catch (e) {
        // ファイルがない場合 (なにもしない)
      }
    }
    router.push("/");
  };

  return (
    <div className="container mt-3">
      <Form validated={validated} noValidate onSubmit={register}>
        <label htmlFor="name" className="form-label">クラン名</label>
        <Form.Control type="text" id="name" value={info.name} onChange={(event) => changeInfo(event, "name")} required />
        <Form.Control.Feedback type="invalid">クラン名の入力は必須です</Form.Control.Feedback>
        <Accordion className="mt-3">
          <Accordion.Item eventKey="0">
            <Accordion.Header>タグ</Accordion.Header>
            <Accordion.Body>
              <div className="row row-cols-auto gx-1 gy-3">
                {
                  tags.map((e, i) => (
                    <div className="col" key={i}>
                      <div className="text-center">{ e.name }</div>
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
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        <div className="my-3">プロフィール画像</div>
        <div className="row gy-3">
        {
          images.map((e, i) => (
            <div className="col-6 col-sm-4 col-md-3 col-lg-2 text-center" key={i}>
              <div className="mb-3">{ i + 1 }枚目</div>
              <img src={e.src} className="img-fluid mb-3" />
              <div>
                <label className="btn btn-primary mb-3">
                  画像の選択
                  <input accept=".jpg,.jpeg" id={"image" + i} style={{display: "none"}} className="mb-3" type="file" onChange={(event) => selectImage(event, i)} />
                </label>
              </div>
              <button type="button" className="btn btn-primary" onClick={() => removeImage(i)}>選択の解除</button>
            </div>
          ))
        }
        </div>
        <label htmlFor="description" className="form-label mt-3">説明</label>
        <textarea className="form-control" id="description" rows={5} value={info.description} onChange={event => changeInfo(event, "description")}></textarea>
        <label htmlFor="twitter" className="form-label mt-3">連絡先ツイッターアカウント</label>
        <div className="input-group">
          <span className="input-group-text">@</span>
          <input type="text" className="form-control" id="twitter" value={info.twitter} onChange={event => changeInfo(event, "twitter")} />
        </div>
        <div className="mt-3">
          <input className="form-check-input" type="checkbox" value="" id="private" checked={info.private} onChange={event => changeInfo(event, "private")} />
          <label className="form-check-label" htmlFor="private">&nbsp;非公開にする</label>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <button type="submit" className="btn btn-primary">登録</button>
          </div>
          <div className="col-6 text-end">
            {
              deletable && (
                confirmed ? (
                  <>
                    <button type="button" className="btn btn-primary text-right me-3" onClick={() => setConfirmed(false)}>取消</button>
                    <button type="button" className="btn btn-danger text-right" onClick={deleteClan}>削除</button>
                  </>
                ) : (
                  <button type="button" className="btn btn-danger text-right" onClick={() => setConfirmed(true)}>削除確認</button>
                )
              )
            }
          </div>
        </div>
      </Form>

      <button onClick={debug}>ステート表示</button>
    </div>
  );
};

export default Register;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookie = nookies.get(context);
  const session = cookie.session;
  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  initFirebaseAdminApp();

  try {
    await getAdminAuth().verifySessionCookie(session, true);
    return { props: {} };
  } catch (error) {
    console.error(error);
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }
};
