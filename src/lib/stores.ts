import { writable } from "svelte/store";

export const myTeamStore = writable(null);
export const sessionStore = writable(null);
export const statusStore = writable(null);
export const argStore = writable(null);
export const keyStore = writable(null);
export const accountsStore = writable<any>({});
export const searchStore = writable("");
export const regionStore = writable("kr");
