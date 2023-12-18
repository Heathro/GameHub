import { Avatar } from "./avatar"
import { Game } from "./game";
import { Poster } from "./poster";

export interface Review {
  id: number;
  reviewerId: number;
  reviewerUsername: string;
  reviewerAvatar: Avatar;
  gameId: number;
  gameTitle: string;
  gamePoster: Poster;
  content: string;
  reviewPosted: Date;
}

export interface ReviewMenu {
  id: number;
  posted: boolean;
  game: Game;
  content: string;
}

export interface ReviewForModeration {
  id: number;
  reviewerId: number;
  reviewerUsername: string;
  reviewerAvatar: Avatar;
  gameId: number;
  gameTitle: string;
  gamePoster: Poster;
  content: string;
  reviewPosted: Date;
  isApproved: boolean;
}