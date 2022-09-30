import { get } from "svelte/store";
import { gameServerStore } from "./stores";
import { invoke } from "@tauri-apps/api/tauri";

const apiKey = "RGAPI-864c6953-b0ff-4536-9ea7-a6e1f02ce004";

/* export const riotRequest = async (url: string) => {
  try {
    return (
      await axios.get(url, {
        headers: {
          "X-Riot-Token": "",
        },
      })
    ).data;
  } catch (error) {
    return new Promise(() => {});
  }
}; */

export const leagueRequest = async (
  url: string,
  method: string = "GET",
  body: any = ""
) => {
  const { port, password } = get(gameServerStore) ?? {};
  if (!port || !password) {
    return;
  }
  url = `https://127.0.0.1:${port}${url}`;
  const authorization = `Basic ${btoa(`riot:${password}`)}`;
  try {
    console.log(url);
    const response: any = await invoke("league_request", {
      url,
      method,
      body,
      authorization,
    });
    return JSON.parse(response);
  } catch (error) {
    console.error("error", error);
  }
};
