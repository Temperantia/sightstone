import { writable } from "svelte/store";
import { analyseTeam } from "./game";
import { leagueRequest } from "./requests";

async function waitUntil(condition) {
  return await new Promise<any>((resolve) => {
    const interval = setInterval(async () => {
      const session = await leagueRequest("/lol-champ-select/v1/session");
      console.log("session");
      if (session) {
        sessionStore.set(session);
        statusStore.set("NEW GAME");
        resolve(session);
        clearInterval(interval);
      }
    }, 1000);
  });
}

export const myTeamStore = writable([]); /* asyncable<any>(async () => {
  console.log("k");
  const session = await waitUntil("");
  const te = await analyseTeam(session.myTeam);
  return Object.values(te);
}); */
export const sessionStore = writable(null);
export const statusStore = writable(null);
