import { Game } from "./game";

export interface ReviewMenu {
  id: number;
  posted: boolean;
  game: Game;
  content: string;
}
