import axios from "axios";
const apiKey = "RGAPI-5506f662-0694-40ca-b6c1-3eeb0ce81fcc";

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
  console.log(process.argv)
  try {
    const response = await axios.get(`https://127.0.0.1:${process.argv[-2]}${url}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`riot:${process.argv[-1]}`).toString(
          "base64"
        )}`,
      },
    });
    return response.data;
  } catch {}
};
