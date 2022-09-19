<script lang="ts">
  import { famousOTP } from "$lib/game";
  import type { Player } from "$lib/types";
  import _ from "lodash";

  export let player: Player;
  export let region: string;

  let deathNote = localStorage.getItem("deathNote") ?? "";

  const opggRegions: { [region: string]: string } = {
    EUW1: "euw.",
    NA: "na.",
    KR: "",
  };

  $: {
    if (
      deathNote.split(",").includes(player.summoner.name) &&
      !player.tags.includes("DEATH NOTE")
    ) {
      player.tags.push("DEATH NOTE");
      player.tags = player.tags;
    } else if (!deathNote.split(",").includes(player.summoner.name)) {
      _.remove(player.tags, (p) => p === "DEATH NOTE");
      player.tags = player.tags;
    }
  }

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
    "DEATH NOTE": "bg-dark text-light",
  };

  const tagInfo: { [tag: string]: string } = {
    "Meta Slave": "Sticked to the meta",
    Smurf: "Good KDA",
    "Limit Tester": "Died a lot",
    Tryhard: "Likes hard champs",
    Lucky: "Won the last games",
    Tilted: "Lost the last games",
    "DEATH NOTE": "You indicated this player is toxic",
  };
</script>

<div
  class="relative flex flex-col items-center justify-between p-3 bg-background w-63 h-96 rounded-xl text-light"
>
  <div class="flex flex-col items-center w-full space-y-2">
    <a
      class="text-lg font-inter text-link"
      href="https://{opggRegions[region]}op.gg/summoner/userName={player
        .summoner.name}"
      target="_blank"
    >
      {player.summoner.name}
    </a>
    <button
      class="absolute w-6 top-1 right-5"
      on:click={() => {
        let list = deathNote.split(",").filter((player) => !!player);
        if (list.includes(player.summoner.name)) {
          _.remove(list, (p) => p === player.summoner.name);
        } else {
          list.push(player.summoner.name);
        }
        deathNote = list.join(",");
        localStorage.setItem("deathNote", list.join(","));
      }}
    >
      <img src="/trash.png" alt="trash" />
    </button>
    <div class="flex items-center">
      {#each player.roles as role}
        <img
          src="/ranked-positions/Position_Bronze-{_.capitalize(
            role === 'ADC' ? 'BOT' : role
          )}.png"
          alt={role}
          class="w-8"
        />
      {/each}
    </div>
    <div class="flex flex-wrap items-center">
      {#each _.entries(player.champions).filter(([_, value]) => value >= 5) as [name, value]}
        <div class="flex items-center pr-1 mb-2 mr-2 space-x-1 border rounded">
          <img
            src="http://ddragon.leagueoflegends.com/cdn/12.11.1/img/champion/{name}.png"
            alt={name}
            class="w-8"
          />
          <div>
            {value >= 10
              ? famousOTP[name]
                ? famousOTP[name] + " WANNABE"
                : "OTP"
              : "MAIN"}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div class="w-full flex flex-col justify-end">
    <div class="flex flex-wrap justify-center space-x-1 min-h-8 my-2">
      {#each player.tags as tag}
        <div
          class="rounded-2xl group relative text-light text-sm my-1 font-inter text-center py-1 px-4 {tagVariants[
            tag
          ] ?? 'bg-warning'}"
        >
          {tag}
          {#if tagInfo[tag]}
            <span
              class="absolute top-0 left-0 justify-center hidden px-2 py-1 text-sm border rounded-lg w-28 z-5 group-hover:flex bg-background "
            >
              {tagInfo[tag]}
            </span>
          {/if}
        </div>
      {/each}
    </div>
    <div class="flex items-center space-x-2">
      <div>Tilt Score</div>
      <div
        class="relative text-sm font-medium text-center rounded-lg group text-dark"
      >
        <img src="/question.png" class="w-4 h-8" alt="info" />
        <span
          class="absolute hidden w-48 px-2 py-1 text-sm text-center rounded-lg group-hover:flex bg-light -left-15 -top-25 text-dark"
        >
          Point system based on the last 20 games, which analyzes the likely
          performance of the player.
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
    <div class="self-start text-sm font-inter">
      {player.tiltScore}/100
    </div>
    <div class="h-8">
      {#if player.tiltScore === 100}
        This player might run down
      {/if}
    </div>
  </div>
</div>
