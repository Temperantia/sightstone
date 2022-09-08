<script lang="ts">
  import { findChampionName } from "$lib/game";
  import type { Player } from "$lib/types";

  export let player: Player;
</script>

<div class="w-38">
  {#if player.stream}
    <a
      class="flex flex-col items-center"
      target="_blank"
      href={"https://twitch.tv/" + player.stream}
    >
      <img
        class="m-2 border-2 border-purple"
        style="width: 100px; height: 100px"
        src={"http://ddragon.leagueoflegends.com/cdn/12.11.1/img/champion/" +
          findChampionName(player.championId) +
          ".png"}
        alt="osef"
      />
      <div class="font-bold text-purple">{player.summoner.name}</div>
    </a>
  {:else}
    <div class="flex flex-col items-center">
      <img
        class="m-2"
        style="width: 100px; height: 100px"
        src={"http://ddragon.leagueoflegends.com/cdn/12.11.1/img/champion/" +
          findChampionName(player.championId) +
          ".png"}
        alt="osef"
      />
      <div>{player.summoner.name}</div>
    </div>
  {/if}
</div>
