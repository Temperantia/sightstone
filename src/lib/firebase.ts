import { initializeApp } from "firebase/app";
import { collection, doc, getFirestore } from "firebase/firestore";
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyBm7vh-MiDZjtkGWR8u-FyejesjwG4It5M",
  authDomain: "sniper-3485f.firebaseapp.com",
  projectId: "sniper-3485f",
  storageBucket: "sniper-3485f.appspot.com",
  messagingSenderId: "251291927330",
  appId: "1:251291927330:web:2c87478959fac3dde25b7b",
  measurementId: "G-GJY6R57XKY",
};

initializeApp(firebaseConfig);
const firestore = getFirestore();
const functions = getFunctions();

if (process.env.NODE_ENV !== "production") {
  connectFunctionsEmulator(functions, "localhost", 5001);
}

export const featuredDoc = doc(collection(firestore, "games"), "featured");
export const streamerNumber = httpsCallable(functions, "streamerNumber");
export const game = httpsCallable(functions, "game");
