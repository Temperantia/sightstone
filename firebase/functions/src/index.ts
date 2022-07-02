import { https } from "firebase-functions";
import axios from "axios";
import { isEmpty } from "lodash";

const summonerIdRegex = /"summoner_id":"[a-zA-Z0-9_-]*"/g;

export const game = https.onCall(async ({ name, region }) => {
  console.log(name);
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

  url = `https://euw.op.gg/api/spectates/${id}?region=${region}`;
  result = await axios.get(url);
  console.log(result);
  return result.data.data;
});
