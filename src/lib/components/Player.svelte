<script lang="ts">
  import championData from "$lib/champion.json";
  import { positions } from "$lib/game";

  export let player: any;
  const {
    name,
    assignedPosition,
    championId,
    champions,
    smurf,
    offrole,
    onStreak,
    points,
  } = player;

  console.log(player);

  const findChampionName = (championId: number) => {
    return Object.values(championData.data).find(
      ({ key }) => key === championId.toString()
    )?.id;
  };
</script>

<div class="w-min-40">
  <div
    class="bg-blue-900 text-white flex justify-center text-center items-center p-1"
  >
    {name}
  </div>
  <div class="flex flex-col items-center bg-gray-300">
    <div class="flex justify-center items-center h-min-20 w-full">
      {#if championId}
        <img
          class="m-2"
          style="width:50px; height: 50px"
          src={"http://ddragon.leagueoflegends.com/cdn/12.11.1/img/champion/" +
            findChampionName(championId) +
            ".png"}
          alt="osef"
        />
        {#if champions?.[championId]}
          <div>
            <div>{champions[championId].wins.length >= 10 ? "OTP" : ""}</div>
            <div>
              {(
                champions[championId].kda.reduce((sum, kda) => sum + kda, 0) /
                champions[championId].kda.length
              ).toFixed(2)}
            </div>
            <div>
              {(
                (champions[championId].wins.filter((win) => !!win).length /
                  champions[championId].wins.length) *
                100
              ).toFixed(0) + "%"}
            </div>
          </div>
        {:else}
          <div>FIRST TIME</div>
        {/if}
      {/if}
    </div>
    <img
      class="w-16 h-16 my-3"
      src="/ranked-positions/Position_{offrole
        ? 'Bronze'
        : 'Challenger'}-{positions[assignedPosition]}.png"
      alt=""
    />
    <div class="h-min-20">
      {smurf ? "SMURF" : ""}

      {#if onStreak > 2 || onStreak < -2}
        {onStreak} streak
      {/if}
    </div>
  </div>
  {#if points}
    <div class="bg-gray-100 text-center p-2">
      {points} Dodge points, yikes!
    </div>
  {/if}
</div>
