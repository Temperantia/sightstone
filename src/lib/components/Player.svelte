<script lang="ts">
  import championData from "$lib/champion.json";
  import type { Player } from "$lib/types";
  import { findChampionName } from "$lib/game";

  export let player: Player;
  export let right = false;

  const tagVariants: { [tag: string]: string } = {
    "Meta Slave": "bg-primary text-white",
    Tilted: "bg-red text-white",
    Lucky: "bg-primary text-white",
    "Limit Tester": "bg-red text-white",
    Tryhard: "bg-red text-white",
    "E-girl": "bg-primary text-white",
    Healer: "bg-primary text-white",
    Shielder: "bg-primary text-white",
    "Tank Player": "bg-primary text-white",
    "Invisibility Abuser": "bg-primary text-white",
    "Lifesteal Abuser": "bg-primary text-white",
    Smurf: "bg-primary text-white",
  };
</script>

{#if right}
  <div class="flex items-center whitespace-nowrap">
    {#if player.championId}
      <img
        class="m-2"
        style="width: 24px; height: 24px"
        src={"http://ddragon.leagueoflegends.com/cdn/12.11.1/img/champion/" +
          findChampionName(player.championId) +
          ".png"}
        alt="osef"
      />
    {/if}
    {#if player.stream}
      <a
        target="_blank"
        href={"https://twitch.tv/" + player.stream}
        class="text-sm font-bold text-purple"
      >
        {player.summoner.name}
      </a>
    {:else}
      <div class="text-sm text-right">
        {player.summoner.name}
      </div>
    {/if}
  </div>
{:else}
  <div class="flex items-center justify-end whitespace-nowrap">
    {#if player.stream}
      <a
        target="_blank"
        href={"https://twitch.tv/" + player.stream}
        class="text-sm font-bold text-right text-purple"
      >
        {player.summoner.name}
      </a>
    {:else}
      <div class="text-sm text-right">
        {player.summoner.name}
      </div>
    {/if}

    {#if player.championId}
      <img
        class="m-2"
        style="width: 24px; height: 24px"
        src={"http://ddragon.leagueoflegends.com/cdn/12.11.1/img/champion/" +
          findChampionName(player.championId) +
          ".png"}
        alt="osef"
      />
    {/if}
  </div>
{/if}
{#if player.tags}
  <div>
    {#each player.tags as tag}
      <div class="border px-2 py-1 {tagVariants[tag]}">{tag}</div>
    {/each}
  </div>
{/if}
