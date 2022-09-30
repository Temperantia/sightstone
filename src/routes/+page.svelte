<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import PlayerCard from "$lib/components/dodge/PlayerCard.svelte";
  import { profiles } from "$lib/firebase";
  import { playersStore } from "$lib/stores";
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
        playersStore.set(data);
      } catch {}
      loading = false;
    } else {
      playersStore.set(null);
    }
  });
</script>

<div class="relative h-screen">
  <div
    class="absolute w-full h-full"
    style="background-image: url(/toxic.jpeg); background-repeat: no-repeat; background-size: cover;"
  />
  <div class="absolute w-full h-full bg-primary opacity-80" />
  <div
    class="container absolute left-0 right-0 flex flex-col items-center py-10 mx-auto"
  >
    {#if loading}
      <div class="text-4xl text-gold">LOADING</div>
    {:else if $playersStore}
      <div class="mb-20 text-5xl">👀 Team Analysis</div>
      <div class="flex items-center space-x-10">
        {#each $playersStore as player}
          <PlayerCard {player} {region} />
        {/each}
      </div>
    {:else if !loading}
      {#if typeof window !== "undefined" && window.__TAURI__}
        <div>Waiting for a game lobby</div>
      {:else}
        <div class="mb-20 text-4xl text-center">
          Everything you need to know.
        </div>
        <div class="text-2xl text-center">
          Search multiple Summoners or paste your game lobby.
        </div>
        <div>
          <textarea
            class="block p-1 mt-10 text-xl border rounded text-dark placeholder-dark/61 border-lightgray h-45 w-210 bg-tertiary/77"
            placeholder="Tyler1 joined the lobby
RATIRL joined the lobby
TFBlade joined the lobby
Faker joined the lobby
Chap_GG joined the lobby"
            bind:value={message}
          />
          <div class="flex items-center">
            <select
              class="px-5 rounded bg-button text-light font-inter w-34 h-18"
              bind:value={region}
            >
              <option value="EUW1">EUW</option>
              <option value="KR">KR</option>
              <option value="NA">NA</option>
            </select>
            {#if message}
              <button
                class="flex items-center justify-center border rounded w-18 h-18 border-light bg-button"
                on:click={search}
              >
                <img src="/search.svg" alt="search" />
              </button>
            {/if}
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>
{#if typeof window !== "undefined" && !window.__TAURI__ && !players}
  <div
    class="relative flex items-center justify-center h-100"
    style="background-image: url(/select.jpeg); background-repeat: no-repeat; background-size: 100%; background-position: center;"
  >
    <div class="text-3xl text-danger">
      {"<- Where to find the summoner lobby"}
    </div>
  </div>
{/if}
