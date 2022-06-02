<script>
  import { myTeamStore } from "$lib/stores";
  import championData from "$lib/champion.json";

  const findChampionName = (championId) => {
    return Object.values(championData.data).find(
      ({ key }) => key === championId.toString()
    )?.id;
  };
</script>

{#each Object.values($myTeamStore ?? {}) as { name, assignedPosition, championId, champions, smurf, offrole, onStreak }}
  <div>
    {name}
    {assignedPosition}
    {smurf ? "SMURF" : ""}
    {offrole ? "OFF ROLE" : "MAIN ROLE"}
    {onStreak}
    {#if championId}
      <img
        style="width: 300px; height: 100px;"
        src={"http://ddragon.leagueoflegends.com/cdn/img/champion/splash/" +
          findChampionName(championId) +
          "_0.jpg"}
        alt="osef"
      />
      {#if champions[championId]}
        {champions[championId].wins.length >= 10 ? "OTP" : ""}
        {(
          (champions[championId].wins.filter((win) => !!win).length /
            champions[championId].wins.length) *
          100
        ).toFixed(0) + "%"}
        {(
          champions[championId].kda.reduce((sum, kda) => sum + kda, 0) /
          champions[championId].kda.length
        ).toFixed(2)}
      {:else}
        FIRST TIME
      {/if}
    {/if}
  </div>
{/each}
