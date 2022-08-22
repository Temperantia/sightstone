<script lang="ts">
  import championData from "$lib/champion.json";

  export let player;
  export let right = false;

  const findChampionName = (championId: number) => {
    return Object.values(championData.data).find(
      ({ key }) => key === championId.toString()
    )?.id;
  };
</script>

{#if right}
  <div class="flex items-center whitespace-nowrap">
    <img
      class="m-2"
      style="width: 24px; height: 24px"
      src={"http://ddragon.leagueoflegends.com/cdn/12.11.1/img/champion/" +
        findChampionName(player.champion_id) +
        ".png"}
      alt="osef"
    />
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

    <img
      class="m-2"
      style="width: 24px; height: 24px"
      src={"http://ddragon.leagueoflegends.com/cdn/12.11.1/img/champion/" +
        findChampionName(player.champion_id) +
        ".png"}
      alt="osef"
    />
  </div>
{/if}
