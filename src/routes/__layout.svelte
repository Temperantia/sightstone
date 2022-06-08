<script lang="ts">
  import "virtual:windi.css";
  import { leagueRequest } from "$lib/requests";

  import {
    myTeamStore,
    sessionStore,
    statusStore,
    urlParamsStore,
  } from "$lib/stores";
  import { page } from "$app/stores";
  import { analyseTeam } from "$lib/game";

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

  const init = async () => {
    urlParamsStore.set({
      port: $page.url.searchParams.get("port"),
      password: $page.url.searchParams.get("password"),
    });

    setInterval(async () => {
      const session = await leagueRequest("/lol-champ-select/v1/session");
      sessionStore.set(session);
    }, 1000);

    setInterval(getChampions, 1000);
  };

  sessionStore.subscribe(async ($session) => {
    if (!$session || $myTeamStore) {
      return;
    }
    myTeamStore.set({});
    myTeamStore.set(await analyseTeam($session.myTeam));
    console.log($myTeamStore);
  });

  init();
</script>

<slot />
