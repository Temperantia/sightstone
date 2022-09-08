<script lang="ts">
  import "virtual:windi.css";
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Banner from "$lib/components/Banner.svelte";
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
