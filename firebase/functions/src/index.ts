import { fetchGameByUrl } from "./opgg";
import { getAPIToken, twitchRequest } from "./twitch";
import { https } from "firebase-functions";
import axios from "axios";
import { isEmpty } from "lodash";
import { initializeApp } from "firebase-admin";
import Queue from "queue-promise";

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

export const featured = https.onCall(async () => {
  const promise = new Promise(async (resolve) => {
    const games: any[] = [];
    const queue = new Queue({ concurrent: 10, interval: 500 });

    const knownStreamers = (
      await db.collection("streamers").doc("accounts").get()
    ).data();
    if (!knownStreamers) {
      return;
    }

    await getAPIToken();
    const { data } = await twitchRequest(
      "GET",
      "/streams?first=100&game_id=21779"
    );
    let knownCount = 0;
    for (const stream of data) {
      const knownStream = knownStreamers[stream.user_login];
      if (knownStream) {
        knownCount++;
        console.log(stream.user_login);
        for (const account of knownStream.accounts) {
          queue.enqueue(async () => {
            const game = await fetchGameByUrl(account, stream.user_login);
            if (game) {
              games.push(game);
              if (games.length >= 3) {
                queue.stop();
              }
            }
          });
        }
        if (knownCount >= 3) {
          break;
        }
      }
    }

    queue.on("end", () => {
      resolve(games);
    });
  });

  return await promise;
});
