<script lang="ts">
  import { page } from "$app/stores";

  const items = [
    { label: "Dodge tool", href: "/" },
    { label: "Streamer Scan", href: "" },
  ];
</script>

<nav class="flex items-center justify-between px-10 space-x-10">
  <a href="/">
    <img src="/logo.svg" alt="logo" />
  </a>
  <a
    href="https://discord.gg/zpvE7gW5ST"
    class="flex items-center w-12 cursor-pointer h-18"
    target="_blank"
  >
    <img src="/discord.png" alt="discord" />
  </a>
  <!-- {#each items as item}
    <a href={item.href} class="flex flex-col justify-center h-full">
      <div class="text-2xl">{item.label}</div>
      <div class="h-10">
        {#if item.href === $page.url.pathname}
          <img src="/highlight.svg" alt="highlight" />
        {/if}
      </div>
    </a>
  {/each} -->
</nav>
