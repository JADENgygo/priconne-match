import React, { useState } from "react";
import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";
import { deleteDoc, doc, getFirestore, collection } from "firebase/firestore";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import nookies from "nookies";
import { initFirebaseAdminApp } from "../lib/firebase-admin";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const Delete: NextPage = () => {
  const [disabled, setDisabled] = useState(true);
  const router = useRouter();

  const confirm = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDisabled(event.target.value !== "プリコネ");
  };

  const deleteAccount = async () => {
    const auth = getAuth();
    if (!auth.currentUser) {
      return;
    }
    const db = getFirestore();
    const docRef = doc(db, "clans", auth.currentUser.uid);
    await deleteDoc(docRef);

    for (let i = 0; i < 4; ++i) {
      const storage = getStorage();
      const reference = ref(storage, `${auth.currentUser.uid}/profile${i}.jpg`);
      try {
        await deleteObject(reference);
      }
      catch (e) {
        // ファイルがない場合 (なにもしない)
      }
    }

    await fetch("/api/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    router.reload();
  };

  return (
    <div className="container mt-3">
      <div>
        アカウントを削除する場合は「プリコネ」と入力してください
        <input
          type="text"
          className="form-control mt-3"
          onChange={confirm}
          id="confirm"
        />
        <button
          type="button"
          className="mt-3 btn btn-outline-danger"
          disabled={disabled}
          onClick={deleteAccount}
          id="deleteButton"
        >
          アカウント削除
        </button>
      </div>
    </div>
  );
};

export default Delete;

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
