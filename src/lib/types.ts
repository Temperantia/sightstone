import type { MetaTypeCreator } from "firelordjs";

export type Player = {
  summoner: { name: string };
  tags: string[];
  tiltScore: number;
  championId?: string;
  position?: string;
  team_key?: string;
  stream?: string;
};
export type Game = { participants: Player[] };

export type Featured = MetaTypeCreator<{ games: Game[] }, "games">;
