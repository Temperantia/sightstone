<script lang="ts">
  import { page } from "$app/stores";
  import FeaturedGame from "$lib/components/FeaturedGame.svelte";
  import PlayerSquare from "$lib/components/PlayerSquare.svelte";
  import { featuredDoc, game } from "$lib/firebase";
  import { getDoc } from "firebase/firestore";

  $: name = $page.url.searchParams.get("name");
  $: region = $page.url.searchParams.get("region");
</script>

{#await game({ name, region })}
  Loading...
{:then result}
  {#if result.data}
    <div class="flex flex-col items-center">
      <div class="text-2xl font-bold">In game - Ranked Solo/Duo</div>
      <div class="flex flex-col items-center py-5 border border-grey-light-2">
        <div class="flex items-center space-x-10">
          {#each result.data.participants.filter(({ team_key }) => team_key === "BLUE") as player}
            <PlayerSquare {player} />
          {/each}
        </div>
        <div>vs</div>
        <div class="flex items-center space-x-10">
          {#each result.data.participants.filter(({ team_key }) => team_key === "RED") as player}
            <PlayerSquare {player} />
          {/each}
        </div>
      </div>
    </div>
  {:else}
    Not in game in this region
  {/if}
{/await}
<div class="my-10">
  <div class="text-xl font-bold">See other Games</div>
  {#await getDoc(featuredDoc)}
    Loading ...
  {:then snap}
    <div class="flex space-x-5">
      {#each snap.data().games.slice(0, 3) as game}
        <FeaturedGame {game} />
      {/each}
    </div>
  {/await}
</div>
