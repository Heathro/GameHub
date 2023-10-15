import { Screenshot } from "./screenshot";

export interface Game {
  id: number;
  title: string;
  poster: string;
  screenshots: Screenshot[];
}