<script lang="ts">
  import { analyseTeam } from "$lib/game";

  import { leagueRequest } from "$lib/requests";
  import champions from "$lib/champion.json";

  import { myTeamStore, sessionStore, statusStore } from "$lib/stores";

  let poller;

  async function waitUntil(condition) {
    return new Promise<any>((resolve) => {
      const interval = setInterval(async () => {
        const session = await leagueRequest("/lol-champ-select/v1/session");
        console.log("session");
        if (session) {
          sessionStore.set(session);
          statusStore.set("NEW GAME");
          resolve(session);
          clearInterval(interval);
        }
      }, 1000);
    });
  }

  const init = async () => {

    const session = await waitUntil("");

   console.log("waited");
    const t = await analyseTeam(session.myTeam);
    console.log("finish")

    console.log("team", Object.values(t)) 
   // myTeamStore.set(Object.values(t));
   // myTeamStore.set([{name: "ok"}]);
  };

/*   myTeamStore.subscribe((value) => {
    console.log("valu", value);
    t = value;
  }); */

  $: init();
</script>

{#each $myTeamStore as team}
  {team.name}
  {team.assignedPosition}
  {#if team.championId}
    <img
      src={"http://ddragon.leagueoflegends.com/cdn/img/champion/splash/" +
        champions[team.championId].name +
        "_0.jpg"}
      alt="osef"
    />
  {/if}
{/each}
<slot />
