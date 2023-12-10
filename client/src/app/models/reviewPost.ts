import { Game } from "./game";

export interface ReviewPost {
  posted: boolean;
  game: Game;
  content: string;
}
