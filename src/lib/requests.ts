import axios from "axios";
import { get } from "svelte/store";
import { urlParamsStore } from "./stores";

const apiKey = "RGAPI-864c6953-b0ff-4536-9ea7-a6e1f02ce004";

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
