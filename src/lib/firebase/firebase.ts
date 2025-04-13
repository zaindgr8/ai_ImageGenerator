import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAVOD1MPuaTgFyYLOzRGuOV3qBLAwSJ0-M",
  authDomain: "ailawyer-8f713.firebaseapp.com",
  projectId: "ailawyer-8f713",
  storageBucket: "ailawyer-8f713.appspot.com",
  messagingSenderId: "703816458018",
  appId: "1:703816458018:web:b41fd379f407be46a00f7b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
