import { Genres } from "./genres";
import { Platforms } from "./platforms";

export interface Filter {
  platforms: Platforms;
	genres: Genres;
}