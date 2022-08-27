<script lang="ts">
  import Player from "$lib/components/Player.svelte";
  import { profiles } from "$lib/firebase";

  let message = "";
  let players = null;
</script>

<textarea
  class="border w-80 h-40"
  placeholder="ROX Smeb joined the room.
ROX Peanut joined the room.
ROX Kuro joined the room.
ROX PraY joined the room.
ROX GorillA joined the room."
  bind:value={message}
/>
<button
  on:click={async () => {
    const result = await profiles({ message });
    players = result.data;
  }}>GO</button
>
<div class="flex my-20">
  {#each players ?? [] as player}
    {#if player}
      <Player {player} />
    {/if}
  {/each}
</div>
