import { https } from "firebase-functions";
import axios from "axios";
import { isEmpty } from "lodash";
import admin from "firebase-admin";
import { analyseProfile } from "./blitz";
import { load } from "cheerio";

const app = admin.initializeApp();
const db = app.firestore();

const summonerIdRegex = /"summoner_id":"[a-zA-Z0-9_-]*"/g;
const regionRegex = new RegExp(/(?<=https:\/\/)(.*?)(?=.op.gg)/g);

const findStream = (name: string, region: string, streamers: any) => {
  const entries: any = Object.entries(streamers);
  for (const [stream, { accounts }] of entries) {
    if (!accounts) {
      continue;
    }
    for (let account of accounts) {
      try {
        account = decodeURI(account);
      } catch {
        continue;
      }
      let accountName = account.substring(account.lastIndexOf("/") + 1);
      accountName = accountName.substring(accountName.lastIndexOf("=") + 1);
      const match = account.match(regionRegex);
      if (!match) {
        continue;
      }
      let accountRegion = match[0];
      if (accountRegion === "www") {
        accountRegion = "kr";
      }
      if (
        accountName.toLocaleLowerCase() === name.toLocaleLowerCase() &&
        accountRegion === region
      ) {
        return stream;
      }
    }
  }
};

const fetchGame = async ({
  name,
  region,
}: {
  name: string;
  region: string;
}) => {
  let url: string = `https://www.op.gg/summoners/${region}/${encodeURI(name)}`;
  let result = await axios.get(url);
  if (!result.data) {
    return null;
  }
  const match = result.data.match(summonerIdRegex);
  if (isEmpty(match)) {
    return null;
  }
  const id = JSON.parse("{" + match[0] + "}").summoner_id;

  try {
    url = `https://op.gg/api/spectates/${id}?region=${region}`;
    result = await axios.get(url);
    console.log(result);
  } catch {
    return null;
  }

  const streamers = (
    await db.collection("streamers").doc("accounts").get()
  ).data();
  if (!streamers) {
    return null;
  }

  const data = result.data.data;

  data.participants = data.participants.map((participant: any) => {
    const stream = findStream(participant.summoner.name, region, streamers);
    if (stream) {
      return { ...participant, stream };
    }
    return participant;
  });

  return data;
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

const messageRegex = /^.* joined/g;

export const profiles = https.onCall(async ({ message }) => {
  const players = message.split("\n").map(async (line: string) => {
    const match = line.match(messageRegex);
    if (match) {
      const name = match[0].replace(" joined", "");
      const metaResult = await axios("https://blitz.gg/lol/tierlist");
      const $ = load(metaResult.data);
      const tier1 = $("title")
        .filter(function () {
          return $(this).text().trim() === "tier-1";
        })
        .parent()
        .parent()
        .parent();
      const meta = tier1
        .find('[class^="ChampionImgSimple"]')
        .map(function () {
          return $(this).attr("alt");
        })
        .toArray();
      return { summoner: { name }, tags: await analyseProfile(name, meta) };
    }
    return null;
  });
  return await Promise.all(players);
});
