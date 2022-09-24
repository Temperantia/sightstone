<script lang="ts">
  import "virtual:windi.css";
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Banner from "$lib/components/Banner.svelte";
  import { invoke } from "@tauri-apps/api/tauri";
  import { onMount } from "svelte";
  import { gameServerStore } from "$lib/stores";
  import { getClient } from "@tauri-apps/api/http";
  import { analyseTeam, fetchPlayers } from "$lib/game";

  onMount(() => {
    setInterval(async () => {
      const lockfile: string = await invoke("my_custom_command");
      if (!lockfile) {
        gameServerStore.set(null);
        return;
      }
      const [name, username, port, password] = lockfile.split(":");
      gameServerStore.set({ name, username, port, password });
      fetchPlayers();
    }, 5000);
  });
</script>

<div class="bg-primary text-light">
  <Header />
  <main>
    <slot />
  </main>
  <Banner />
  <Footer />
</div>

<style>
  :global(body) {
    font-family: "Righteous", sans-serif;
  }
</style>
