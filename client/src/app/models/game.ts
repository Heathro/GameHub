import { Genres } from "./genres";
import { Platforms } from "./platforms";
import { Poster } from "./poster";
import { Screenshot } from "./screenshot";

export interface Game {
  id: number;
  title: string;
  description: string;
  likes: number[];
  platforms: Platforms;
  genres: Genres;
  poster: Poster;
  screenshots: Screenshot[];
}