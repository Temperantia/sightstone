<script>
  import _ from "lodash";
  import { streamerNumber, featuredDoc } from "$lib/firebase";
  import FeaturedGame from "$lib/components/FeaturedGame.svelte";
  import { getDoc } from "firebase/firestore";
</script>

{#await streamerNumber()}
  Loading ...
{:then { data }}
  <div class="text-xl font-semibold text-center">
    Currently: {data} streamers revealed
  </div>
{/await}

<div class="my-10">
  <div class="text-3xl font-bold">Featured Games</div>
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
