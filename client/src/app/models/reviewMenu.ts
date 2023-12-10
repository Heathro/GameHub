import { Game } from "./game";

export interface ReviewMenu {
  posted: boolean;
  game: Game;
  content: string;
}
