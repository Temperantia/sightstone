<script lang="ts">
  import type { Player } from "$lib/types";

  export let player: Player;

  const tagVariants: { [tag: string]: string } = {
    "Meta Slave": "bg-success text-dark",
    Tilted: "bg-red text-dark",
    Lucky: "bg-success text-dark",
    "Limit Tester": "bg-red text-dark",
    Tryhard: "bg-red text-dark",
    "E-girl": "bg-success text-dark",
    Healer: "bg-success text-dark",
    Shielder: "bg-success text-dark",
    "Tank Player": "bg-success text-dark",
    "Invisibility Abuser": "bg-success text-dark",
    "Lifesteal Abuser": "bg-success text-dark",
    Smurf: "bg-success text-dark",
  };
</script>

<div
  class="bg-light w-63 h-80 flex flex-col justify-between items-center rounded-xl p-3"
>
  <div class="w-full flex flex-col items-center space-y-5">
    <div class="text-darkgray text-lg font-inter">
      {player.summoner.name}
    </div>
    <div class="flex flex-wrap justify-center flex-row space-x-1">
      {#each player.tags as tag}
        <div
          class="rounded-2xl text-sm my-1 font-inter border text-center py-1 px-4 {tagVariants[
            tag
          ] ?? 'bg-warning text-dark'}"
        >
          {tag}
        </div>
      {/each}
    </div>
  </div>

  <div class="w-full">
    <div class="text-gray font-inter">Tilt Score</div>
    <div class="w-full bg-lightgray h-2 my-1">
      <div
        class="{player.tiltScore > 70
          ? 'bg-danger'
          : player.tiltScore > 30
          ? 'bg-warning'
          : 'bg-success'} h-2"
        style="width: {player.tiltScore}%"
      />
    </div>
    <div class="text-gray text-sm font-inter self-start">
      {player.tiltScore}/100
    </div>
  </div>
</div>
