import { Avatar } from "./avatar";

export interface Player {
  id: number;
  username: string;
  avatar: Avatar;
  realname: string;
  summary: string;
  country: string;
  city: string;
  created: string;
  lastActive: string;
}

export interface LikedPlayer {
  id: number;
  username: string;
  avatar: Avatar;
  lastActive: string;
}