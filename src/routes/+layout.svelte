<script lang="ts">
  import "virtual:windi.css";
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Banner from "$lib/components/Banner.svelte";
  import { invoke } from "@tauri-apps/api/tauri";
  import { onDestroy, onMount } from "svelte";
  import { gameServerStore, playersStore } from "$lib/stores";
  import { fetchPlayers } from "$lib/game";
  import { profiles } from "$lib/firebase";
  import { leagueRequest } from "$lib/requests";

  let queueLoop: NodeJS.Timer;
  let lobbyLoop: NodeJS.Timer;

  const getLockfileData = async () => {
    const lockfile: string = await invoke("my_custom_command");
    if (!lockfile) {
      gameServerStore.set(null);
      return;
    }
    const [name, username, port, password] = lockfile.split(":");
    gameServerStore.set({ name, username, port, password });
  };

  const startLobby = () => {
    lobbyLoop = setInterval(async () => {
      const session = await leagueRequest("/lol-champ-select/v1/session");
      if (!session) {
        clearInterval(lobbyLoop);
        startQueue();
        return;
      }
      playersStore.update((players) => {
        if (players) {
          players = players.map((player) => {
            const sessionPlayer = session.myTeam.find(
              (sessionPlayer: any) =>
                sessionPlayer.summonerId === player.summoner.id
            );
            player.assignedPosition = sessionPlayer.assignedPosition;
            player.championId = sessionPlayer.championId;
            return player;
          });
        }
        return players;
      });
    }, 1000);
  };

  const startQueue = () => {
    queueLoop = setInterval(async () => {
      await getLockfileData();

      const { id, chat } = await fetchPlayers();
      if (!chat) {
        return;
      }

      console.log(chat);
      const summoners = chat.map(({ name }: any) => name);
      const { data } = await profiles({
        region: "EUW1",
        summoners,
      });
      if (!data) {
        return;
      }

      try {
        await leagueRequest(
          "/lol-chat/v1/conversations/" + id + "/messages",
          "POST",
          JSON.stringify({
            body: encodeURI(
              "https://thesightstone.com?summoners=" + summoners.join(",")
            ),
          })
        );
      } catch (error) {
        console.error(error);
      }

      const players = data.map((player) => {
        const chatPlayer = chat.find(
          (chatPlayer: any) => chatPlayer.name === player.summoner.name
        );
        player.summoner.id = chatPlayer.summonerId;

        return player;
      });

      console.log(players);

      playersStore.set(players);
      startLobby();
      clearInterval(queueLoop);
    }, 5000);
  };

  onMount(() => {
    if (typeof window !== "undefined" && window.__TAURI__) {
      startQueue();
    }
  });

  onDestroy(() => {
    clearInterval(queueLoop);
    clearInterval(lobbyLoop);
  });
</script>

<div class="bg-primary text-light">
  {#if typeof window !== "undefined" && !window?.__TAURI__}
    <Header />
  {/if}
  <main>
    <slot />
  </main>
  {#if typeof window !== "undefined" && !window?.__TAURI__}
    <Banner />
    <Footer />
  {/if}
</div>

<style>
  :global(body) {
    font-family: "Righteous", sans-serif;
  }
</style>
