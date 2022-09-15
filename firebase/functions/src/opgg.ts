import axios from "axios";
import { isEmpty } from "lodash";

const summonerIdRegex = /"summoner_id":"[a-zA-Z0-9_-]*"/g;
const regionRegex = new RegExp(/(?<=https:\/\/)(.*?)(?=.op.gg)/g);

export const fetchGameByUrl = async (url: string, stream: string) => {
  let region = url.match(regionRegex)?.[0];
  if (!region) {
    return null;
  }
  if (region === "www") {
    region = "kr";
  }
  let result = await axios.get(url);
  if (!result.data) {
    return;
  }
  const match = result.data.match(summonerIdRegex);
  if (isEmpty(match)) {
    return;
  }
  const id = JSON.parse("{" + match[0] + "}").summoner_id;

  url = `https://op.gg/api/spectates/${id}?region=${region}`;
  try {
    result = await axios.get(url);
    const data = result.data.data;
    data.participants = data.participants.map((participant: any) => {
      if (participant.summoner.summoner_id === id) {
        return { ...participant, stream };
      }
      return participant;
    });
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
