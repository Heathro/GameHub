import { Poster } from "./poster";
import { Screenshot } from "./screenshot";

export interface Game {
  id: number;
  title: string;
  poster: Poster;
  screenshots: Screenshot[];
}