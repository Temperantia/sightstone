import { request, gql } from "graphql-request";
import { entries, takeWhile } from "lodash";
import { archetypes } from "./constants";

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

export const analyseProfile = async (
  name: string,
  region: string,
  meta: any
) => {
  const playerResult = await request(
    "https://riot.iesdev.com/graphql",
    playerQuery,
    { summoner_name: name, region }
  );
  const result = await request(
    "https://league-player.iesdev.com/graphql",
    query,
    {
      maxMatchAge: 300,
      first: 20,
      region,
      queue: "RANKED_SOLO_5X5",
      accountId: playerResult.leagueProfile.accountId,
    }
  );

  archetypes["Meta Slave"] = meta;

  const stats: any = {
    champions: {},
    archetypes: {},
    roles: {},
    wins: [],
    tiltScore: 10,
    behaviour: {
      smurf: 0,
      limitTester: 0,
    },
    players: [],
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
    if (playerMatch.playerMatchStats.win) {
      stats.tiltScore -= 5;
    } else {
      stats.tiltScore += 10;
    }

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

  const roles = Object.entries(stats.roles)
    .filter(([_key, value]: any) => value >= 5)
    .map(([key]: any) => key);

  const tags = Object.entries(stats.archetypes)
    .filter(([_key, value]: any) => value >= 5)
    .map(([key]: any) => key);

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

  const loseStreak = takeWhile(stats.wins, (win) => !win).length;
  if (loseStreak >= 3) {
    tags.push("Tilted");
  }
  if (loseStreak >= 4) {
    stats.tiltScore += 100;
  } else if (loseStreak === 3) {
    stats.tiltScore += 80;
  } else if (loseStreak === 2) {
    stats.tiltScore += 20;
  }

  if (stats.tiltScore > 100) {
    stats.tiltScore = 100;
  } else if (stats.tiltScore < 0) {
    stats.tiltScore = 0;
  }

  return {
    roles,
    tags,
    tiltScore: stats.tiltScore,
    champions: stats.champions,
  };
};
