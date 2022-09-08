<script lang="ts">
  import { page } from "$app/stores";

  const items = [
    { label: "Dodge tool", href: "/" },
    { label: "Streamer Scan", href: "" },
  ];
</script>

<nav class="flex items-center space-x-10">
  <img src="/logo.svg" alt="logo" />
  {#each items as item}
    <a href={item.href} class="flex flex-col justify-center h-full">
      <div class="text-2xl">{item.label}</div>
      <div class="h-10">
        {#if item.href === $page.url.pathname}
          <img src="/highlight.svg" alt="highlight" />
        {/if}
      </div>
    </a>
  {/each}
</nav>
