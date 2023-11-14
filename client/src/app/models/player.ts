import { Avatar } from "./avatar";

export interface Player {
  id: number;
  userName: string;
  avatar: Avatar;
  realname: string;
  summary: string;
  country: string;
  city: string;
  created: string;
  lastActive: string;
}
