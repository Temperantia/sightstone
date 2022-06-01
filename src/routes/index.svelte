<script>
  import { myTeamStore } from "$lib/stores";
  import champions from "$lib/champion.json";

  console.log($myTeamStore);
</script>
{#each $myTeamStore as { name, assignedPosition, championId }}
  {name}
  {assignedPosition}
  {#if championId}
    <img
      src={"http://ddragon.leagueoflegends.com/cdn/img/champion/splash/" +
        champions[championId].name +
        "_0.jpg"}
      alt="osef"
    />
  {/if}
{/each}
