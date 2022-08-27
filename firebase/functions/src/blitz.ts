import { request, gql } from "graphql-request";
import _, { entries, filter, sortBy, takeWhile } from "lodash";

const query = gql`
  query matches(
    $region: Region!
    $accountId: String!
    $first: Int
    $role: Role
    $queue: Queue
    $championId: Int
    $riotSeasonId: Int
    $maxMatchAge: Int
  ) {
    matches(
      region: $region
      accountId: $accountId
      first: $first
      role: $role
      queue: $queue
      championId: $championId
      riotSeasonId: $riotSeasonId
      maxMatchAge: $maxMatchAge
    ) {
      id
      riotMatchId
      gameCreation
      duration
      queue
      region
      leaguePatch {
        majorVersion
        minorVersion
      }
      playerMatches(accountId: $accountId) {
        accountId
        teamId
        role
        champion {
          id
          name
          normalizedName
        }
        matchStatsFromClient {
          lp
          deltaLp
          division
          tier
        }
        playerMatchStats {
          opponentChampionId
          goldDiffAtLaneEnd
          creepScoreDiffAtLaneEnd
          goldAtLaneEnd
          goldEarned
          goldSpent
          win
          kills
          assists
          deaths
          time_cc_others
          total_time_cc_dealt
          wards_purchased
          wardsPlaced
          wardsKilled
          damageDealt
          damage_to_champions
          damage_to_towers
          damage_to_objectives
          damageSelfMitigated
          damage_taken
          damage_healed
          damage_physical_dealt
          damage_magic_dealt
          damage_true_dealt
          minions_killed_neutral
          minions_killed_total
          killingSprees
          doubleKills
          tripleKills
          quadraKills
          pentaKills
          first_blood
          firstInhibitorKill
          firstTowerKill
          champLevel
          largest_critical
          largestKillingSpree
          largestMultiKill
          turrets_killed
          perkPrimaryStyle
          perkSubStyle
          perks
          spells
          items
          visionScore
        }
      }
    }
  }
`;

const playerQuery = gql`
  query LeagueProfile(
    $summoner_name: String
    $summoner_id: String
    $account_id: String
    $region: Region!
    $puuid: String
  ) {
    leagueProfile(
      summoner_name: $summoner_name
      summoner_id: $summoner_id
      account_id: $account_id
      region: $region
      puuid: $puuid
    ) {
      id
      accountId
      puuid
      summonerId
      summonerName
      summonerLevel
      profileIconId
      updatedAt
      latestRanks {
        queue
        tier
        rank
        wins
        losses
        leaguePoints
        insertedAt
      }
    }
  }
`;

const famousOTP: any = {
  Vayne: "Gosu",
  Riven: "Boxbox",
  Twitch: "RatIRL",
  Sion: "Thebausffs",
  Annie: "Annie OTP",
  Udyr: "Trick2g",
  "Master Yi": "Cowsep",
  Draven: "Tyler1",
  Vladimir: "Elite500",
  Singed: "Singed420",
};

const archetypes: any = {
  "E-girl": [
    "Lulu",
    "Nami",
    "Janna",
    "Yuumi",
    "Soraka",
    "Sona",
    "Lux",
    "Karma",
  ],
  Healer: [],
  Shielder: ["Janna", "Lulu", "Karma"],
  "Tank Player": [
    "Ornn",
    "Shen",
    "Malphite",
    "Sejuani",
    "Rammus",
    "Maokai",
    "Chogath",
    "Udyr",
    "Zac",
    "Volibear",
    "Amumu",
    "DrMundo",
  ],
  Tryhard: [
    "Vayne",
    "Katarina",
    "Yasuo",
    "Yone",
    "Irelia",
    "Azir",
    "Riven",
    "Lee Sin",
    "Fiora",
    "Fizz",
    "Aphelios",
    "Kalista",
    "Ryze",
    "Qiyana",
    "Jayce",
    "Sylas",
    "Cassiopeia",
    "Draven",
    "Viego",
    "Kayle",
    "Rengar",
    "Zed",
    "Samira",
    "Master Yi",
    "Kassadin",
  ],
  "Invisibility Abuser": ["Evelynn", "Twitch", "Khazix", "Akshan"],
  "Lifesteal Abuser": [
    "Aatrox",
    "Kayn",
    "Vladimir",
    "Darius",
    "Kled",
    "Olaf",
    "Warwick",
    "Swain",
  ],
};

export const analyseProfile = async (name: string) => {
  const playerResult = await request(
    "https://riot.iesdev.com/graphql",
    playerQuery,
    { summoner_name: name, region: "EUW1" }
  );
  const result = await request(
    "https://league-player.iesdev.com/graphql",
    query,
    {
      maxMatchAge: 300,
      first: 20,
      region: "EUW1",
      queue: "RANKED_SOLO_5X5",
      accountId: playerResult.leagueProfile.accountId,
    }
  );
  archetypes["Meta Slave"] = [];

  const stats: any = {
    champions: {},
    archetypes: {},
    roles: {},
    wins: [],
    behaviour: {
      smurf: 0,
      limitTester: 0,
    },
  };

  for (const match of result.matches) {
    const playerMatch = match.playerMatches[0];
    const champion = playerMatch.champion.normalizedName;

    if (!stats.champions[champion]) {
      stats.champions[champion] = 0;
    }
    ++stats.champions[champion];

    const e: any = entries(archetypes);
    for (const [archetype, champions] of e) {
      if (champions.includes(champion)) {
        if (!stats.archetypes[archetype]) {
          stats.archetypes[archetype] = 0;
        }
        ++stats.archetypes[archetype];
      }
    }

    const role = playerMatch.role;
    if (!stats.roles[role]) {
      stats.roles[role] = 0;
    }
    ++stats.roles[role];

    stats.wins.push(playerMatch.playerMatchStats.win);

    if (playerMatch.playerMatchStats.deaths >= 8) {
      ++stats.behaviour.limitTester;
    }
    if (
      (playerMatch.playerMatchStats.kills +
        playerMatch.playerMatchStats.assists) /
        playerMatch.playerMatchStats.deaths >=
      5
    ) {
      ++stats.behaviour.smurf;
    }
  }

  console.log(stats);

  const tags = [
    ...Object.entries(stats.champions)
      .filter(([_key, value]: any) => value >= 5)
      .map(([key, value]: any) => {
        if (value >= 10) {
          return famousOTP[key] ?? key + " OTP";
        } else if (value >= 5) {
          return key + " Main";
        }
      }),
    ...Object.entries(stats.archetypes)
      .filter(([_key, value]: any) => value >= 5)
      .map(([key]: any) => key),
    ...Object.entries(stats.roles)
      .filter(([_key, value]: any) => value >= 5)
      .map(([key]: any) => key),
  ];

  if (
    Object.values(stats.champions).filter((value: any) => value > 2).length ===
    0
  ) {
    tags.push("4Fun Player");
  }

  if (stats.behaviour.smurf >= 10) {
    tags.push("Smurf");
  }

  if (stats.behaviour.limitTester >= 10) {
    tags.push("Limit Tester");
  }

  if (takeWhile(stats.wins, (win) => win).length >= 3) {
    tags.push("Lucky");
  }

  if (takeWhile(stats.wins, (win) => !win).length >= 3) {
    tags.push("Tilted");
  }

  return tags;
};
