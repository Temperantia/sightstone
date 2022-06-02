import { get } from "svelte/store";
import { riotRequest, leagueRequest } from "./requests";
import { myTeamStore, statusStore } from "./stores";

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

const streak = (gameWins) => {
  let winStreak = 0;
  let loseStreak = 0;
  for (const win of gameWins) {
    if (win) {
      ++winStreak;
    } else {
      ++loseStreak;
    }
    if (winStreak > 0 && loseStreak > 0) {
      break;
    }
  }

  return winStreak > loseStreak
    ? winStreak + "+ streak"
    : loseStreak + "- streak";

  console.info(
    winStreak > loseStreak ? winStreak + "+ streak" : loseStreak + "- streak"
  );
};

const analysePlayer = async ({ name, assignedPosition }: any) => {
  /*   if (name === "Milk Cheikh" || name === "Chaotic Blade" || name === "jjimdak abuser") {
    return;
  } */
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
    `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&queue=420&type=ranked`
  );
  if (!matchIds) {
    console.error("couldnt find the matches for " + name);
    return;
  }
  const gameWins = [];
  const gamePositions = [];
  const kdas = [];
  const champions = {};
  for (const matchId of matchIds) {
    const game = await riotRequest(
      `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}`
    );
    if (!game) {
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

  console.info(assignedPosition);

  const smurf = isSmurf(kdas);
  const offrole = isOffrole(assignedPosition, gamePositions);
  const onStreak = streak(gameWins);

  // team comp ap ad tank early late
  return { champions, smurf, offrole, onStreak };
};

const fetchPlayers = async () => {
  const convs = await leagueRequest("/lol-chat/v1/conversations");
  const conv = convs.find(({ type }) => type === "championSelect");
  if (!conv) {
    return;
  }
  const champSelectConv = await leagueRequest(
    "/lol-chat/v1/conversations/" + conv.id + "/participants"
  );
  return champSelectConv;
};

export const analyseTeam = async (players) => {
  const chat = await fetchPlayers();
  if (!chat) {
    return;
  }
  const team = {};
  for (const { summonerId, name } of chat) {
    if (summonerId) {
      team[summonerId] = { name };
    }
  }

  console.log(team)

  for (const { summonerId, championId, assignedPosition } of players) {
    if (summonerId) {
      team[summonerId] = { ...team[summonerId], championId, assignedPosition };
    }
  }
  const values: any = Object.entries(team);
  for (const [id, player] of values) {
    team[id] = { ...team[id], ...(await analysePlayer(player)) };
    console.log(team[id])
  }

  console.log(team);

  console.info("Waiting for everyone to lock picks...");

 /*  while (get(statusStore) === "NEW GAME") {
    const session = await leagueRequest("/lol-champ-select/v1/session");
    if (!session) {
      break;
    }

    if (session.timer.phase === "FINALIZATION") {
      for (const {
        championId,
        summonerId,
        assignedPosition,
      } of session.myTeam) {
        console.info(assignedPosition);
        const champion = championPerformance(
          team[summonerId].champions?.[championId]
        );
        team[summonerId].champion = champion;
        console.info("");
      }
      myTeamStore.set(team);
      statusStore.set("FINALIZATION");
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  } */

  return team;
};
