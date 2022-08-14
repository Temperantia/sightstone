<script>
  import { regionStore, searchStore, accountsStore } from "$lib/stores";
  import Player from "$lib/components/Player.svelte";
  import { positions } from "$lib/game";
  import _ from "lodash";
  import { game, streamerNumber, featured } from "$lib/firebase";
  import FeaturedGame from "$lib/components/FeaturedGame.svelte";

  const playersMock = {
    "27750808": {
      name: "Milk Cheikh",
      championId: 121,
      assignedPosition: "jungle",
      champions: {
        "22": {
          championName: "Ashe",
          wins: [false],
          kda: [3.25],
        },
        "111": {
          championName: "Nautilus",
          wins: [false, false, false],
          kda: [2.6666666666666665, 3, 1.5714285714285714],
        },
        "145": {
          championName: "Kaisa",
          wins: [false, true, true],
          kda: [2, 5, 13],
        },
        "222": {
          championName: "Jinx",
          wins: [false],
          kda: [1],
        },
        "497": {
          championName: "Rakan",
          wins: [false, true],
          kda: [0.5454545454545454, 11],
        },
      },
      smurf: false,
      offrole: true,
      onStreak: -1,
      points: 0,
    },
    "67656840": {
      name: "ShoneFrost",
      championId: 50,
      assignedPosition: "bottom",
      champions: {
        "18": {
          championName: "Tristana",
          wins: [false],
          kda: [1.4],
        },
        "29": {
          championName: "Twitch",
          wins: [false],
          kda: [1.75],
        },
        "50": {
          championName: "Swain",
          wins: [false, false, true],
          kda: [3.375, 2.1538461538461537, 9],
        },
        "67": {
          championName: "Vayne",
          wins: [false, true, false, false],
          kda: [2.8, 4, 0.8571428571428571, 2.6666666666666665],
        },
        "202": {
          championName: "Jhin",
          wins: [false],
          kda: [2.2],
        },
      },
      smurf: false,
      offrole: false,
      onStreak: -2,
      points: 20,
    },
    "73419522": {
      name: "Gogeta Chevolved",
      championId: 163,
      assignedPosition: "middle",
      champions: {
        "163": {
          championName: "Taliyah",
          wins: [true, true, true, true, false, false, false],
          kda: [4.8, 4, 3.4, 16, 2, 1.4, 1],
        },
        "166": {
          championName: "Akshan",
          wins: [true, true, true],
          kda: [5.4, 2.875, 5.666666666666667],
        },
      },
      smurf: false,
      offrole: false,
      onStreak: 4,
      points: 20,
    },
    "134047344": {
      name: "aVitalDuelist",
      championId: 114,
      assignedPosition: "top",
      champions: {
        "86": {
          championName: "Garen",
          wins: [false],
          kda: [1],
        },
        "114": {
          championName: "Fiora",
          wins: [false, true, true, false, false, true, false, true, true],
          kda: [0.625, 3, 8, 2, 2.142857142857143, 3, 1.25, 0.875, 1.25],
        },
      },
      smurf: false,
      offrole: false,
      onStreak: -1,
      points: 20,
    },
    "136036825": {
      name: "Żěref",
      championId: 0,
      assignedPosition: "utility",
      champions: {
        "8": {
          championName: "Vladimir",
          wins: [false],
          kda: [1],
        },
        "10": {
          championName: "Kayle",
          wins: [true],
          kda: [1.6],
        },
        "34": {
          championName: "Anivia",
          wins: [true],
          kda: [2.272727272727273],
        },
        "38": {
          championName: "Kassadin",
          wins: [true],
          kda: [3.4285714285714284],
        },
        "150": {
          championName: "Gnar",
          wins: [false],
          kda: [1.1538461538461537],
        },
        "157": {
          championName: "Yasuo",
          wins: [true],
          kda: [1.3125],
        },
        "238": {
          championName: "Zed",
          wins: [true],
          kda: [4],
        },
        "412": {
          championName: "Thresh",
          wins: [true],
          kda: [15],
        },
        "497": {
          championName: "Rakan",
          wins: [false, false],
          kda: [2, 1.7777777777777777],
        },
      },
      smurf: false,
      offrole: true,
      onStreak: -1,
      points: 20,
    },
  };

  const keys = Object.keys(positions);
  let teams = [];

  const search = async () => {
    try {
      const result = await game({
        name: $searchStore,
        region: $regionStore,
      });
      console.log(result);
      const team = result.data.data.participants.map(
        ({ position, summoner, team_key, champion_id }) => ({
          assignedPosition: position ?? "",
          name: summoner.name,
          teamKey: team_key,
          championId: champion_id,
        })
      );
      teams = _.values(
        _.groupBy(
          _.values(team).sort(
            (a, b) =>
              keys.indexOf(a.assignedPosition?.toLowerCase()) -
              keys.indexOf(b.assignedPosition?.toLowerCase())
          ),
          "teamKey"
        )
      );
    } catch (err) {
      console.log(err);
      teams = [];
    }
  };
</script>

<div class="px-20 pt-5 pb-20">
  <div class="flex flex-col items-center py-3 space-y-1">
    <div class="text-5xl" style="font-family: Righteous">👩🏼‍🎤 Stream Sniper</div>
    <div class="text-xs font-bold text-red">
      This version does not work at 100% yet!
    </div>
    <div class="text-xs font-bold text-red">
      You like this website? Why not share it to a friend?
    </div>
  </div>

  <div class="text-3xl text-center">Find who is in your game!</div>
  <div class="flex justify-center py-10">
    <input
      placeholder="Search Summoner Name"
      class="px-6 py-3 text-sm border rounded w-96 border-grey-light-2 bg-grey-light-1 placeholder-grey"
      bind:value={$searchStore}
    />
    <select
      class="px-6 py-3 text-sm border rounded w-39 border-grey-light-2 bg-grey-light-1"
      bind:value={$regionStore}
    >
      <option value="kr">KR</option>
      <option value="euw">EUW</option>
      <option value="na">NA</option>
    </select>
    <button
      class="flex items-center justify-center rounded w-15 h-15 bg-primary"
      on:click={search}
    >
      <img src="/search.svg" alt="search" width="16" height="16" />
    </button>
  </div>

  {#await streamerNumber() then { data }}
    <div class="text-xl font-semibold text-center">
      Currently: {data} streamers revealed
    </div>
  {/await}

  <!--   <div class="flex flex-col items-center mx-5 space-y-5">
    {#each teams as team}
      <div class="flex space-x-5">
        {#each team as player}
          <Player {player} />
        {/each}
      </div>
    {/each}
  </div> -->

  <div class="my-10">
    <div class="text-3xl font-bold">Featured Games</div>
    {#await featured() then { data }}
      <div class="flex space-x-5">
        {#each data as game}
          <FeaturedGame {game} />
        {/each}
      </div>
    {/await}
  </div>

  <div class="py-8 text-white rounded px-13 bg-blue">
    <div class="text-2xl font-bold" style="font-family: Montserrat">
      Buy us a coffee!
    </div>
    <div class="text-lg" style="font-family: Montserrat">
      Help us maintain this project!
    </div>
    <div class="text-lg" style="font-family: Montserrat">
      Contact us at <a
        class="text-primary"
        href="mailto: hello.limitlessleagueteam@gmail.com"
        >hello.limitlessLeagueteam@gmail.com</a
      >
    </div>
  </div>
</div>
<div class="px-10 py-16 text-lg text-white bg-black">
  © 2022 Streamsniper. Streamsniper isn't endorsed by Riot Games and doesn't
  reflect the views or opinions of Riot Games or anyone officially involved in
  producing or managing League of Legends. League of Legends and Riot Games are
  trademarks or registered trademarks of Riot Games, Inc. League of Legends ©
  Riot Games, Inc.
</div>
