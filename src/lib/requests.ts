import axios from "axios";
import { get } from "svelte/store";
import { urlParamsStore } from "./stores";

const apiKey = "RGAPI-e65c6afb-bdf9-4b1b-b312-ffcad085210f";

export const riotRequest = async (url: string) => {
  try {
    return (
      await axios.get(url, {
        headers: {
          "X-Riot-Token": apiKey,
        },
      })
    ).data;
  } catch (error) {
    return new Promise(() => {});
  }
};

export const leagueRequest = async (url: string) => {
  const { port, password } = get(urlParamsStore);
  try {
    const response = await axios.get(`https://127.0.0.1:${port}${url}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`riot:${password}`).toString(
          "base64"
        )}`,
      },
    });
    return response.data;
  } catch {}
};
