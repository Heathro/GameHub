import { Categories } from "./categories";
import { Genres } from "./genres";
import { Platforms } from "./platforms";

export interface Filter {
  categories: Categories;
  platforms: Platforms;
	genres: Genres;
}