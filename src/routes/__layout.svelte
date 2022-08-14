<script lang="ts">
  import "virtual:windi.css";
  import { leagueRequest } from "$lib/requests";

  import {
    accountsStore,
    argStore,
    keyStore,
    myTeamStore,
    sessionStore,
    statusStore,
  } from "$lib/stores";
  import { analyseTeam } from "$lib/game";
  import { browser } from "$app/env";

  let loading = false;

  const getChampions = async () => {
    if (!$myTeamStore) {
      return;
    }

    const session = await leagueRequest("/lol-champ-select/v1/session");
    if (!session) {
      return;
    }
    myTeamStore.update(($myTeam) => {
      for (const { summonerId, championId } of session.myTeam) {
        $myTeam[summonerId] = { ...$myTeam[summonerId], championId };
      }
      return $myTeam;
    });
  };

  /*   const init = async () => {
    const accounts = await getAccounts();
    accountsStore.set(accounts);
    if (browser) {
      keyStore.set(localStorage.getItem("key") ?? null);
    }

    setInterval(() => {
      if (browser) {
        argStore.set((window as any).args);
      }
    }, 1000);

    setInterval(async () => {
      const session = await leagueRequest("/lol-champ-select/v1/session");
      sessionStore.set(session);
    }, 1000);

    setInterval(getChampions, 1000);
  }; */

  sessionStore.subscribe(async ($session) => {
    if (loading || !$session || $myTeamStore) {
      return;
    }
    //myTeamStore.set({});
    loading = true;
    myTeamStore.set(await analyseTeam($session.myTeam));
    console.log($myTeamStore);
  });

  /*   init();
   */
</script>

<slot />

<style>
  :global(*) {
    font-family: "Inter", sans-serif;
  }
</style>
