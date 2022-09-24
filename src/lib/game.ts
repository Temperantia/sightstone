import { riotRequest, leagueRequest } from "./requests";
import championData from "$lib/champion.json";

export const positions = {
  top: "Top",
  jungle: "Jungle",
  mid: "Mid",
  adc: "Bot",
  support: "Support",
};

export const famousOTP: { [name: string]: string } = {
  Aatrox: "",
  Ahri: "Vertigal",
  Akali: "Care4Dash",
  Akhshan: "Chenchen53",
  Alistar: "Alicopter",
  Amumu: "",
  Anivia: "Froggen",
  Annie: "Annie Bot",
  Aphelios: "Remmacs",
  Ashe: "",
  AurelionSol: "Vchee",
  Azir: "Witness",
  Bard: "Lathyrus",
  Caitlyn: "Geranimo",
  Cassiopeia: "Chovy",
  Chogath: "Alex Blais",
  Darius: "KB",
  Diana: "Kai Lunari",
  Draven: "Tyler1",
  Ekko: "Douglas Killer",
  Evelynn: "Besteveusa",
  Ezreal: "ACE_Ezreal",
  Fiora: "Giraffe",
  Fizz: "Mangofish",
  Gangplank: "Solarbacca",
  Katarina: "Evolved",
  Heimerdinger: "Hjarnan",
  Kindred: "Pyosik",
  Irelia: "Wickd",
  Kassadin: "Xpeke",
  Khazix: "Tinjus",
  Leblanc: "Faker",
  LeeSin: "Gripex",
  Lucian: "lltrigger",
  MasterYi: "Cowsep",
  Morgana: "Luminum",
  MissFortune: "Dog2",
  Nami: "Bizzleberry",
  Nidalee: "Tent",
  Nunu: "Kesha",
  Riven: "Boxbox",
  Samira: "Jiferz",
  Shaco: "Pink Ward",
  Sion: "Thebausffs",
  Singed: "Singed420",
  Sona: "Takyre",
  Talon: "Talongodx",
  TwistedFate: "Dopa",
  Twitch: "RatIRL",
  Udyr: "Trick2g",
  Vayne: "Gosu",
  Veigar: "Necroside",
  Vex: "PekinWoof",
  Viego: "WickjKR",
  Vladimir: "Elite500",
  Xayah: "Pearlsayah",
  Xerath: "zwag",
  Yasuo: "Yassuo",
  Zed: "LL stylish",
};

export const findChampionName = (championId: string) => {
  return Object.values(championData.data).find(({ key }) => key === championId)
    ?.id;
};

const isPosition = (position: string, positions: string[]) => {
  return positions.reduce((sum, p) => (p === position ? sum + 1 : sum), 0) >= 8;
};

const isSmurf = (kdas: number[]) => {
  const kda =
    kdas.reduce((sum: number, kda: number) => sum + kda, 0) / kdas.length;
  if (kda >= 5) {
    return true;
    console.info("SMURF " + kda.toFixed(2));
  }
  return false;
};

const isOffrole = (assignedPosition: string, gamePositions) => {
  const positions = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"].filter(
    (position) => isPosition(position, gamePositions)
  );

  if (
    positions.find((position) => position === assignedPosition.toUpperCase())
  ) {
    return false;
    console.info("MAIN ROLE");
  } else {
    return true;
    console.info("OFF ROLE");
  }
};

const championPerformance = (champion) => {
  if (!champion) {
    return "FIRST TIME";
    console.info("FIRST TIME");
  } else {
    let msg = "";
    if (champion.wins.length >= 10) {
      msg += "OTP";
      console.info("OTP");
    }
    const winrate =
      (
        (champion.wins.filter((win: boolean) => !!win).length /
          champion.wins.length) *
        100
      ).toFixed(0) + "%";
    const kda = (
      champion.kda.reduce((sum: number, kda: number) => sum + kda, 0) /
      champion.kda.length
    ).toFixed(2);
    return (msg += ` ${champion.championName} ${champion.wins.length} games ${winrate} ${kda}`);
    console.info(
      `${champion.championName} ${champion.wins.length} games ${winrate} ${kda}`
    );
  }
};

const analysePlayer = async ({ name, assignedPosition }: any) => {
  const player = await riotRequest(
    "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" +
      encodeURI(name)
  );
  if (!player) {
    console.error("couldnt find player id for " + name);
    return;
  }
  const { puuid } = player;
  const matchIds = await riotRequest(
    `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10&queue=420&type=ranked`
  );
  if (!matchIds) {
    console.error("couldnt find the matches for " + name);
    return;
  }
  const gameWins = [];
  const gamePositions = [];
  const kdas = [];
  const champions: any = {};
  for (const matchId of matchIds) {
    const game = await riotRequest(
      `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}`
    );
    if (!game) {
      console.error("skipping a game");
      continue;
    }
    const {
      championId,
      championName,
      teamPosition,
      kills,
      deaths,
      assists,
      win,
    } = game.info.participants.find(
      (participant) => participant.puuid === puuid
    );
    gameWins.push(win);
    gamePositions.push(teamPosition);
    if (!champions[championId]) {
      champions[championId] = { championName, wins: [], kda: [] };
    }
    const kda = (kills + assists) / (deaths === 0 ? 1 : deaths);
    champions[championId].wins.push(win);
    champions[championId].kda.push(kda);
    kdas.push(kda);
  }

  const smurf = isSmurf(kdas);
  const offrole = isOffrole(assignedPosition, gamePositions);

  return { champions, smurf, offrole };
};

export const fetchPlayers = async () => {
  const convs = await leagueRequest("/lol-chat/v1/conversations");
  if (!convs) {
    return;
  }
  const conv = convs.find(
    ({ type }: { type: string }) => type === "championSelect"
  );
  if (!conv) {
    return;
  }
  const champSelectConv = await leagueRequest(
    "/lol-chat/v1/conversations/" + conv.id + "/participants"
  );
  return champSelectConv;
};

export const analyseTeam = async () => {
  const chat = await fetchPlayers();
  if (!chat) {
    return;
  }
  const team: { [summonerId: string]: any } = {};
  for (const { summonerId, name } of chat) {
    if (summonerId) {
      team[summonerId] = { name };
    }
  }

  console.log(team);

  return team;
};
