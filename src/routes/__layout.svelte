<script lang="ts">
  import "virtual:windi.css";
  import { regionStore, searchStore } from "$lib/stores";

  import { game } from "$lib/firebase";
  import { goto } from "$app/navigation";

  const search = async () => {
    goto("/search?name=" + $searchStore + "&region=" + $regionStore);
  };
</script>

<div class="px-20 pt-5 pb-20">
  <div class="flex flex-col items-center py-3 space-y-1">
    <div class="text-5xl" style="font-family: Righteous">👩🏼‍🎤 The Sightstone</div>
    <div class="text-xs font-bold text-red">
      This version does not work at 100% yet!
    </div>
    <div class="text-xs font-bold text-red">
      You like this website? Why not share it to a friend?
    </div>
  </div>

  <div class="text-3xl text-center">Find who is in your game!</div>
  <div class="flex justify-center py-10">
    <input
      placeholder="Search Summoner Name"
      class="px-6 py-3 text-sm border rounded w-96 border-grey-light-2 bg-grey-light-1 placeholder-grey"
      bind:value={$searchStore}
    />
    <select
      class="px-6 py-3 text-sm border rounded w-39 border-grey-light-2 bg-grey-light-1"
      bind:value={$regionStore}
    >
      <option value="kr">KR</option>
      <option value="euw">EUW</option>
      <option value="na">NA</option>
    </select>
    <button
      class="flex items-center justify-center rounded w-15 h-15 bg-primary"
      on:click={search}
    >
      <img src="/search.svg" alt="search" width="16" height="16" />
    </button>
  </div>

  <slot />

  <div class="py-8 text-white rounded px-13 bg-blue">
    <div class="text-2xl font-bold" style="font-family: Montserrat">
      Buy us a coffee!
    </div>
    <div class="text-lg" style="font-family: Montserrat">
      Help us maintain this project!
    </div>
    <div class="text-lg" style="font-family: Montserrat">
      Contact us at <a
        class="text-primary"
        href="mailto: hello.limitlessleagueteam@gmail.com"
        >hello.limitlessleagueteam@gmail.com</a
      >
    </div>
  </div>
</div>
<div class="px-10 py-16 text-lg text-white bg-black">
  © 2022 Streamsniper. Streamsniper isn't endorsed by Riot Games and doesn't
  reflect the views or opinions of Riot Games or anyone officially involved in
  producing or managing League of Legends. League of Legends and Riot Games are
  trademarks or registered trademarks of Riot Games, Inc. League of Legends ©
  Riot Games, Inc.
</div>

<style>
  :global(*) {
    font-family: "Inter", sans-serif;
  }
</style>
