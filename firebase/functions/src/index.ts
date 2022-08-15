import { https } from "firebase-functions";
import axios from "axios";
import { isEmpty } from "lodash";
import { initializeApp } from "firebase-admin";

const app = initializeApp();
const db = app.firestore();

const summonerIdRegex = /"summoner_id":"[a-zA-Z0-9_-]*"/g;

const fetchGame = async ({
  name,
  region,
}: {
  name: string;
  region: string;
}) => {
  let url: string = `https://www.op.gg/summoners/${region}/${encodeURI(name)}`;
  let result = await axios.get(url);
  console.log(result.data.length);
  if (!result.data) {
    return;
  }
  const match = result.data.match(summonerIdRegex);
  if (isEmpty(match)) {
    return;
  }
  const id = JSON.parse("{" + match[0] + "}").summoner_id;
  console.log(id);

  url = `https://op.gg/api/spectates/${id}?region=${region}`;
  result = await axios.get(url);
  console.log(result);
  return result.data.data;
};

export const game = https.onCall((data) => {
  return fetchGame(data);
});

export const streamerNumber = https.onCall(async () => {
  const streamers = (
    await db.collection("streamers").doc("accounts").get()
  ).data();
  if (!streamers) {
    return 0;
  }
  return Object.keys(streamers).length;
});
