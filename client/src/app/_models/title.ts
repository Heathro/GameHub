import { Screenshot } from "./screenshot";

export interface Title {
  id: number;
  title: string;
  poster: string;
  screenshots: Screenshot[];
}