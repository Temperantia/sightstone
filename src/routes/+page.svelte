<script lang="ts">
  import { goto } from "$app/navigation";

  import { page } from "$app/stores";

  import PlayerCard from "$lib/components/dodge/PlayerCard.svelte";

  import { profiles } from "$lib/firebase";
  import type { Player } from "$lib/types";
  import _ from "lodash";

  const messageRegex = /^.* joined/g;

  let message = "";
  let players: Player[] | null = null;
  let region = "EUW1";
  let loading = false;

  const search = async () => {
    const summoners = message.split("\n").map((line) => {
      const match = line.match(messageRegex);
      if (match) {
        const name = match[0].replace(" joined", "");
        return name;
      }
      return null;
    });
    goto("?region=" + region + "&summoners=" + summoners.join(","));
  };

  page.subscribe(async (page) => {
    const region = page.url.searchParams.get("region");
    const summoners = page.url.searchParams.get("summoners")?.split(",");
    if (region && summoners) {
      loading = true;
      try {
        const { data } = await profiles({ region, summoners });
        players = data;
      } catch {}
      loading = false;
    } else {
      players = null;
    }
  });
</script>

<div class="relative h-[841px]">
  <div
    class="absolute w-full h-full"
    style="background-image: url(/toxic.jpeg); background-repeat: no-repeat; background-size: cover;"
  />
  <div class="absolute w-full h-full bg-primary opacity-60" />
  <div
    class="container absolute left-0 right-0 flex flex-col items-center py-10 mx-auto"
  >
    {#if loading}
      <div class="text-gold text-4xl">LOADING</div>
    {:else if players}
      <div class="text-5xl mb-20">👀 Team Analysis</div>
      <div class="flex items-center space-x-3">
        {#each players as player}
          <PlayerCard {player} />
        {/each}
      </div>
    {:else if !loading}
      <div class="mb-20 text-4xl text-center">
        Find out if you should <span class="text-secondary">DODGE</span> your League
        Of Legends Game
      </div>
      <div class="text-3xl text-center">
        Search multiple Summoner names or paste your game lobby.
      </div>
      <div>
        <textarea
          class="block p-1 mt-20 text-xl border rounded text-dark placeholder-dark/61 border-lightgray h-45 w-210 bg-tertiary/77"
          placeholder="Tyler1 joined the lobby,
RATIRL joined the lobby,
TFBlade joined the lobby,
Faker joined the lobby,
Chap_GG joined the lobby"
          bind:value={message}
        />
        <div class="flex items-center">
          <select
            class="px-5 rounded bg-light text-dark font-inter w-34 h-18"
            bind:value={region}
          >
            <option value="EUW1">EUW</option>
            <option value="KR">KR</option>
            <option value="NA">NA</option>
          </select>
          <button
            class="flex items-center justify-center border rounded w-18 h-18 border-light bg-button"
            on:click={search}
          >
            <img src="/search.svg" alt="search" />
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
{#if players}
  <div />
{:else}
  <div
    class="relative flex items-center justify-center h-100"
    style="background-image: url(/select.jpeg); background-repeat: no-repeat; background-size: 100%; background-position: center;"
  >
    <div class="text-3xl text-danger">
      {"<- Where to find the summoner lobby"}
    </div>
  </div>
{/if}
