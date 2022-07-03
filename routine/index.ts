import axios from "axios";
import { readFileSync, writeFileSync } from "fs";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import Queue from "queue-promise";
import _ from "lodash";

import serviceAccount from "./sniper-3485f-firebase-adminsdk-954dc-cc88148958.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
});

// https://id.twitch.tv/oauth2/authorize?client_id=ju8eq7rs6l90rcnvk0lexadm96gghu&redirect_uri=http://localhost:3000&response_type=code&scope=chat:read+chat:edit
// twitch token --scopes "chat:read chat:edit"

export const firestore = getFirestore();
const accountDoc = firestore.collection("streamers").doc("accounts");

const clientId = "ju8eq7rs6l90rcnvk0lexadm96gghu"; //"ix0r0umc25icbhym8uf2j2j1d6kiww";
const clientSecret = "0tmpbpddq0id3wyx9pxvh6502y0d4k"; // "yowu9eveae5xt5oeias2iu9furoksf";
const username = "ohwowbunga"; // "snakerequest13"; //"milkcheikh"; //

let page;
let APIToken;
let identity;

/* const cookies = {
  server_session_id: "2348ae9ffbd641a0bd26a2c7fd644482",
  "auth-token": "5mfeyrogvow9sg99n9ysm8w1hviba6",
  "twilight-user":
    "{%22authToken%22:%225mfeyrogvow9sg99n9ysm8w1hviba6%22%2C%22displayName%22:%22milkcheikh%22%2C%22id%22:%22788331099%22%2C%22login%22:%22milkcheikh%22%2C%22roles%22:{%22isStaff%22:false}%2C%22version%22:2}",
  api_token: "e75ff7f24016d869dfd1294b614a5221",
  last_login: "2022-06-13T22:58:12Z",
  name: "milkcheikh",
  login: "milkcheikh",
  _gid: "GA1.2.1470739353.1655159419",
  language: "en",
  experiment_overrides: "{%22experiments%22:{}%2C%22disabled%22:[]}",
  "twitch.lohp.countryCode": "SE",
  _ga: "GA1.2.1396402111.1647569228",
  unique_id: "5ec0bd9c915b9660",
};
const arr = Object.entries(cookies).map(([key, value]) => ({
  name: key,
  value,
})); */

const getToken = async () => {
  const { data } = await axios.post(
    "https://id.twitch.tv/oauth2/token?client_id=" +
      clientId +
      "&client_secret=" +
      clientSecret +
      "&grant_type=authorization_code&redirect_uri=http://localhost:3000&code=19ty7fv30ej5haov00t7nnii4noiz4"
  );
  writeFileSync("token.json", JSON.stringify(data));
  return data;
};

const twitchRequest = async (
  method: string,
  endpoint: string,
  APIToken: string
) => {
  const { data } = await axios.request({
    method,
    url: "https://api.twitch.tv/helix" + endpoint,
    headers: {
      Authorization: "Bearer " + APIToken,
      "Client-Id": clientId,
    },
  });
  return data;
};

const getAPIToken = async () => {
  console.info("fetching api token");
  const {
    data: { access_token },
  } = await axios.post(
    "https://id.twitch.tv/oauth2/token?client_id=" +
      clientId +
      "&client_secret=" +
      clientSecret +
      "&grant_type=client_credentials"
  );
  APIToken = access_token;
  console.info("retrived api token");
  return access_token;
};

const refreshTokens = async () => {
  const { refresh_token } = JSON.parse(readFileSync("token.json").toString());
  const { data } = await axios.post(
    "https://id.twitch.tv/oauth2/token?client_id=" +
      clientId +
      "&client_secret=" +
      clientSecret +
      "&grant_type=refresh_token&refresh_token=" +
      refresh_token
  );
  writeFileSync("token.json", JSON.stringify(data));
  identity = {
    username,
    password: "oauth:" + data.access_token,
  };
  return data;
};

const getUserFollows = async (APIToken: string) => {
  let follows: any[] = [];
  let cursor;
  do {
    const data = await twitchRequest(
      "GET",
      "/users/follows?from_id=788331099" + (cursor ? "&after=" + cursor : ""),
      APIToken
    );
    follows = [...follows, ...data.data];
    cursor = data.pagination.cursor;
  } while (cursor);
  return follows;
};

const getStreams = async () => {
  let streams: any[] = [];
  let cursor;
  do {
    const data = await twitchRequest(
      "GET",
      "/streams?first=100&game_id=21779" + (cursor ? "&after=" + cursor : ""),
      APIToken
    );
    streams = [...streams, ...data.data];
    cursor = data.pagination.cursor;
  } while (cursor);

  streams = streams.filter(({ viewer_count }) => viewer_count >= 10);

  return streams;
};

const followStream = async (channel: string, page: any) => {
  await page.goto("https://www.twitch.tv/" + channel);
  await new Promise((resolve) => setTimeout(resolve, 5000));
  const only = await page.$x("//p[text()='Followers-Only Chat']");
  if (only) {
    const follow = await page.$x(
      "//button[@data-test-selector='follow-button']"
    );
    if (follow) {
      await follow?.[0]?.click();
      await new Promise((resolve) => setTimeout(resolve, 5000));
      if (follow?.[0]) {
        console.log("followed " + channel + " because they want only chat");
      }
    }
  }
};

const findInfo = async (streams: any[]) => {
  console.log(streams.length);
  const data = (await accountDoc.get()).data() ?? {};

  const parseInfo = async (stream) => {
    const channel = stream.user_login;
    const channels = _.uniq(
      _.flatten(
        await Promise.all([
          parseNightbot(channel),
          parseStreamElements(channel),
        ])
      )
    );
    if (!_.isEmpty(channels)) {
      if (!data[channel]) {
        data[channel] = {};
      }
      data[channel].accounts = channels;
      //console.log(channel, stream.viewer_count, data[channel].accounts);
    }
  };

  const queue = new Queue({ concurrent: 100, interval: 500 });
  for (const stream of streams) {
    queue.enqueue(() => parseInfo(stream));
  }
  queue.on("stop", () => {
    console.log("now " + Object.keys(data).length);
    accountDoc.set(data, { merge: true });
    writeFileSync("data.json", JSON.stringify(data));
  });
};

const httpsRegex = new RegExp(
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g
);

const profileRegex = new RegExp(
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}(op|u).gg\/\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g
);

const regionRegex = new RegExp(/(?<=https:\/\/)(.*?)(?=.op.gg)/g);

const onMessage =
  (channel: string) => async (_target, _context, msg: string) => {
    //console.log(channel, msg);
    const match = msg.match(httpsRegex);
    if (match && msg.includes("commands")) {
      /*  const accounts = msg.match(regex);
      console.log(accounts);
      if (!accounts) {
        return;
      }
      const region = accounts[0].match(regionRegex); */
      console.log(match);
      const data = (await accountDoc.get()).data();
      if (!data) {
        return;
      }
      //data[channel] = { msg, region, accounts };
      data[channel] = { commands: match[0] };
      await accountDoc.set(data, { merge: true });
    }
  };

const onConnected = (channel: string, client) => () => {
  console.log("connected to https://twitch.tv/" + channel);
  client.say(channel, "!commands");
};

const parseStreamElements = async (channel: string) => {
  try {
    let response = await axios.get(
      "https://api.streamelements.com/kappa/v2/channels/" + channel
    );

    const id = response.data._id;
    response = await axios.get(
      "https://api.streamelements.com/kappa/v2/bot/commands/" + id + "/public"
    );
    const match = JSON.stringify(response.data).match(profileRegex);
    return match ?? [];
  } catch {
    return [];
  }
};

const parseNightbot = async (channel: string) => {
  try {
    let response = await axios.get(
      "https://api.nightbot.tv/1/channels/t/" + channel
    );
    const id = response.data.channel._id;
    response = await axios.get("https://api.nightbot.tv/1/commands", {
      headers: {
        "nightbot-channel": id,
      },
    });
    const match = JSON.stringify(response.data).match(profileRegex);
    return match ?? [];
  } catch {
    return [];
  }
};

/* const sendInChat = (channel: string) => {
  return new Promise((resolve) => {
    const client = new tmi.client({ identity, channels: [channel] });
    client.on("message", onMessage(channel));
    client.on("connected", onConnected(channel, client));
    client.connect();
    setTimeout(() => {
      try {
        client.disconnect();
      } catch (error) {}
      resolve(null);
    }, 8000);
  });
}; */

/* const initPage = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  page = await browser.newPage();
  await page.goto("https://twitch.tv");
  //await page.setCookie(...arr);
  return page;
}; */

const main = async () => {
  // await initPage();
  //await getToken();
  // await refreshTokens();
  await getAPIToken();

  findInfo(await getStreams());

  /*   new CronJob(
    "0 0 * * * *",
    async () => {
      findInfo(await getStreams());
    },
    null,
    true
  ); */
};

main();
