<script lang="ts">
  import _ from "lodash";
  import Player from "./Player.svelte";

  export let game: any;

  $: teams = _.values(_.groupBy(game.participants, "team_key"));
</script>

<div class="flex flex-col items-center">
  <div class="my-5 font-bold text-center">Ranked Solo/Duo</div>
  <div class="flex items-center px-4 border border-grey-light-1">
    <div>
      {#each teams[0] as player}
        <Player {player} />
      {/each}
    </div>
    <div>
      {#each teams[1] as player}
        <Player {player} right />
      {/each}
    </div>
  </div>
</div>
