<script lang="ts">
  import PlayerCard from "$lib/components/dodge/PlayerCard.svelte";

  import { profiles } from "$lib/firebase";
  import type { Player } from "$lib/types";
  import _ from "lodash";

  let message = "";
  let searching = false;
  let players: Player[];

  const search = async () => {
    searching = true;
    const { data } = await profiles({ message });
    players = data;
    searching = false;
  };
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
    {#if players}
      <div class="text-5xl mb-20">👀 Team Analysis</div>
      <div class="flex items-center space-x-3">
        {#each players as player}
          <PlayerCard {player} />
        {/each}
      </div>
    {:else}
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
          <select class="px-5 rounded bg-light text-dark font-inter w-34 h-18">
            <option>EUW</option>
            <option>KR</option>
            <option>NA</option>
          </select>
          {#if !searching}
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
