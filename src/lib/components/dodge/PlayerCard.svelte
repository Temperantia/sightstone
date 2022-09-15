<script lang="ts">
  import type { Player } from "$lib/types";

  export let player: Player;

  const tagVariants: { [tag: string]: string } = {
    "Meta Slave": "bg-success text-dark",
    Tilted: "bg-danger text-dark",
    Lucky: "bg-success text-dark",
    "Limit Tester": "bg-danger text-dark",
    Tryhard: "bg-danger text-dark",
    "E-girl": "bg-success text-dark",
    Healer: "bg-success text-dark",
    Shielder: "bg-success text-dark",
    "Tank Player": "bg-success text-dark",
    "Invisibility Abuser": "bg-success text-dark",
    "Lifesteal Abuser": "bg-success text-dark",
    Smurf: "bg-success text-dark",
  };

  const tagInfo: { [tag: string]: string } = {
    "Meta Slave": "Sticked to the meta",
    Smurf: "Good KDA",
    "Limit Tester": "Died a lot",
    Tryhard: "Likes hard champs",
    Lucky: "Won the last games",
    Tilted: "Lost the last games",
  };
</script>

<div
  class="flex flex-col items-center justify-between p-3 bg-light w-63 h-80 rounded-xl"
>
  <div class="flex flex-col items-center w-full space-y-5">
    <div class="text-lg text-darkgray font-inter">
      {player.summoner.name}
    </div>
    <div class="flex flex-row flex-wrap justify-center space-x-1">
      {#each player.tags as tag}
        <div
          class="rounded-2xl group relative text-sm my-1 font-inter border text-center py-1 px-4 {tagVariants[
            tag
          ] ?? 'bg-warning text-dark'}"
        >
          {tag}
          {#if tagInfo[tag]}
            <span
              class="absolute z-5 hidden group-hover:flex bg-light -left-5 top-0 -translate-y-full px-2 py-1 rounded-lg text-center text-dark text-sm after:content-[''] after:absolute after:left-1/2 after:top-[100%] after:-translate-x-1/2 after:border-8 after:border-x-transparent after:border-b-transparent after:border-t-gray-700"
            >
              {tagInfo[tag]}
            </span>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <div class="w-full">
    <div class="flex items-center">
      <div class="text-gray font-inter">Tilt Score</div>
      <div
        class="relative text-sm font-medium text-center rounded-lg group text-dark"
      >
        <img src="/question.png" class="w-4 h-8" alt="info" />
        <span
          class="absolute hidden group-hover:flex bg-light -left-15 -top-25 -translate-y-full w-48 px-2 py-1 bg-gray-700 rounded-lg text-center text-dark text-sm after:content-[''] after:absolute after:left-1/2 after:top-[100%] after:-translate-x-1/2 after:border-8 after:border-x-transparent after:border-b-transparent after:border-t-gray-700"
        >
          Point based system based on the last 20 games, which analyzes the
          likely performance of the player.
        </span>
      </div>
    </div>
    <div class="w-full h-2 my-1 bg-lightgray">
      <div
        class="{player.tiltScore > 70
          ? 'bg-danger'
          : player.tiltScore > 30
          ? 'bg-warning'
          : 'bg-success'} h-2"
        style="width: {player.tiltScore}%"
      />
    </div>
    <div class="self-start text-sm text-gray font-inter">
      {player.tiltScore}/100
    </div>
  </div>
</div>
