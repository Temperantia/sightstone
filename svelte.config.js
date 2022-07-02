import preprocess from "svelte-preprocess";
import adapter from "@sveltejs/adapter-cloudflare";
import WindiCSS from "vite-plugin-windicss";

const dev = process.env.NODE_ENV == "development";

export default {
  kit: {
    adapter: adapter(),
    prerender: {
      default: true,
    },

    vite: {
      compilerOptions: { dev },
      plugins: [WindiCSS()],
    },
  },

  preprocess: preprocess(),
};
