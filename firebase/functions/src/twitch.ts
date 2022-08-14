import axios from "axios";

const clientId = "ju8eq7rs6l90rcnvk0lexadm96gghu"; //"ix0r0umc25icbhym8uf2j2j1d6kiww";
const clientSecret = "0tmpbpddq0id3wyx9pxvh6502y0d4k"; // "yowu9eveae5xt5oeias2iu9furoksf";
//const username = "ohwowbunga"; // "snakerequest13"; //"milkcheikh"; //
let APIToken: string;

export const getAPIToken = async () => {
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
  console.info("retrieved api token");
  return access_token;
};

export const twitchRequest = async (method: string, endpoint: string) => {
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
