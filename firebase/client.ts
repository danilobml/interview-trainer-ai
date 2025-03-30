
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAXuHbMzRYpuep-GSHDpwnw4pkcYEhKKI0",
  authDomain: "prep-master-dad08.firebaseapp.com",
  projectId: "prep-master-dad08",
  storageBucket: "prep-master-dad08.firebasestorage.app",
  messagingSenderId: "932133065802",
  appId: "1:932133065802:web:94a94ed6d67a89722502b3",
  measurementId: "G-E3L03MPGEP"
};

const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
