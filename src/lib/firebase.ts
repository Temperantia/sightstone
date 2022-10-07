import { initializeApp } from "firebase/app";
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from "firebase/functions";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getFirelord, getFirestore } from "firelordjs";
import type { Featured, Player } from "./types";
import { browser } from "$app/environment";

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

export let analytics: Analytics;
if (browser) {
  analytics = getAnalytics();
}

const db = getFirestore()

export const featuredDoc = getFirelord<Featured>(db, "games").doc("featured");

const functions = getFunctions();

if (process.env.NODE_ENV !== "production") {
  connectFunctionsEmulator(functions, "localhost", 5001);
}

export const streamerNumber = httpsCallable<void, number>(
  functions,
  "streamerNumber"
);
export const game = httpsCallable<
  { name: string; region: string },
  { participants: any[] }
>(functions, "game");
export const profiles = httpsCallable<
  { region: string; summoners: string[] },
  Player[]
>(functions, "profiles");
