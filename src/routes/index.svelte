<script>
  import { regionStore, searchStore, accountsStore } from "$lib/stores";
  import Player from "$lib/components/Player.svelte";
  import { positions } from "$lib/game";
  import _ from "lodash";
  import { game } from "$lib/firebase";

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
</script>

<div class="h-screen bg-gray-400">
  <div class="flex justify-center py-10 space-x-3">
    <input bind:value={$searchStore} />
    <select bind:value={$regionStore}>
      <option value="kr">kr</option>
      <option value="euw">euw</option>
      <option value="na">na</option>
    </select>
    <button
      on:click={async () => {
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
      }}
    >
      Search
    </button>
  </div>

  <!-- <input
    value={$keyStore}
    on:blur={(event) => {
      if (browser) {
        localStorage.setItem("key", event.target.value);
      }
      keyStore.set(event.target.value);
    }}
  /> -->
  <div class="flex flex-col items-center mx-5 space-y-5">
    {#each teams as team}
      <div class="flex space-x-5">
        {#each team as player}
          <Player {player} />
        {/each}
      </div>
    {/each}
  </div>

  <!--  <div class="flex items-end justify-center w-1/2 mx-auto mt-40 bg-gray-300">
    <div class="text-8xl">80</div>
    <h2 class="text-xl">Dodge points</h2>
  </div>  -->
</div>
