import axios from "axios";
import { readFileSync, writeFileSync } from "fs";
import tmi from "tmi.js";
import puppeteer from "puppeteer";

const clientId = "ix0r0umc25icbhym8uf2j2j1d6kiww";
const clientSecret = "yowu9eveae5xt5oeias2iu9furoksf";
const username = "snakerequest13"; //"milkcheikh"; //
const password = "Test132!$$p"; //"sjdlmfkjlkmsudfjlk"; //

const code = "9ezoczuzws76ue8mkfdbbb25bhfnz6";

const cookies = {
  server_session_id: "cba9708e51844c92a8c02cb2d0958cd7",
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
}));

const getToken = async () => {
  const { data } = await axios.post(
    "https://id.twitch.tv/oauth2/token?client_id=" +
      clientId +
      "&client_secret=" +
      clientSecret +
      "&grant_type=authorization_code&redirect_uri=http://localhost:3000&code=" +
      code
  );
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
  const {
    data: { access_token },
  } = await axios.post(
    "https://id.twitch.tv/oauth2/token?client_id=" +
      clientId +
      "&client_secret=" +
      clientSecret +
      "&grant_type=client_credentials"
  );
  return access_token;
};

/* const validateToken = async (access_token: string) => {
  const { data } = await axios.get("https://id.twitch.tv/oauth2/validate", {
    headers: {
      // Authorization: "OAuth " + access_token,
    },
  });
  return data;
}; */

const refreshTokens = async (refresh_token: string) => {
  const { data } = await axios.post(
    "https://id.twitch.tv/oauth2/token?client_id=" +
      clientId +
      "&client_secret=" +
      clientSecret +
      "&grant_type=refresh_token&refresh_token=" +
      refresh_token
  );
  writeFileSync("token.json", JSON.stringify(data));
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
  console.log(follows.length);
  return follows;
};

const getStreams = async (APIToken: string) => {
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
  console.log(streams.length);
  return streams;
};

const followStreams = async (streams, page) => {
  let followCount = 0;
  let unfollowCount = 0;

  for (const stream of streams) {
    const channel = stream.to_login;
    await page.goto("https://www.twitch.tv/" + channel);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const only = await page.evaluate(() =>
      (window as any).find("Followers-Only Chat")
    );
    if (only) {
      const follow = await page.$x(
        "//button[@data-test-selector='follow-button']"
      );
      if (follow) {
        await follow?.[0]?.click();
        await new Promise((resolve) => setTimeout(resolve, 5000));
        if (follow?.[0]) {
          console.log(
            "followed " +
              channel +
              " #" +
              followCount +
              " because they want only chat"
          );
          ++followCount;
        }
      }
    } else {
      const unfollow = await page.$x(
        "//button[@data-test-selector='unfollow-button']"
      );
      if (unfollow) {
        await unfollow?.[0]?.click();
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const confirm = await page.$x(
          "//button[@data-a-target='modal-unfollow-button']"
        );
        await confirm?.[0]?.click();
        await new Promise((resolve) => setTimeout(resolve, 2000));
        unfollowCount += 1;
        console.log(unfollowCount);
      }
    }
  }
};

const sendInChat = async (channel: string, identity) => {
  const client = new tmi.client({ identity, channels: [channel] });
  client.on("message", (_target, _context, msg) => {
    console.log(msg);
  });
  client.on("connected", () => {
    try {
      client.say(channel, "!opgg");
    } catch (error) {
      console.log(error);
    }
  });
  client.connect();
};

const initPage = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto("https://twitch.tv");
  await page.setCookie(...arr);
  return page;
};

const main = async () => {
  //const page = await initPage();
  let tokens = JSON.parse(readFileSync("token.json").toString());
  /*   const info = await validateToken(tokens.access_token);
  if (info.expires_in === 0) { */
  tokens = await refreshTokens(tokens.refresh_token);
  //}
  const identity = {
    username: "milkcheikh",
    password: "oauth:" + tokens.access_token,
  };
  const APIToken = await getAPIToken();
  const streams = await getUserFollows(APIToken);
  console.log(streams.length);
  //const streams = await getStreams(APIToken);
  //await followStreams(streams, page);
  //await sendInChat("loltyler1", identity);
};

main();
