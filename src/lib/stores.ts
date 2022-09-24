import { writable } from "svelte/store";

type State = "INIT" | "QUEUE" | "LOBBY" | "GAME";

export const gameServerStore = writable<any>(null);
export const stateStore = writable<State>("INIT");
