import { Avatar } from "./avatar"
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
