import type { MetaTypeCreator } from "firelordjs";

export type Player = {
  summoner: { name: string; id: string };
  tags: string[];
  roles: string[];
  champions: { [name: string]: number };
  tiltScore: number;
  ranked: { rank: string; tier: string; wins: number; losses: number };
  championId?: string;
  assignedPosition?: string;
  team_key?: string;
  stream?: string;
  matches: any[];
};
export type Game = { participants: Player[] };

export type Featured = MetaTypeCreator<{ games: Game[] }, "games">;
