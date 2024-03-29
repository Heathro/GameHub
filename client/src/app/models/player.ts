import { FriendRequestType } from "../enums/friendRequestType";
import { FriendStatus } from "../enums/friendStatus";
import { Avatar } from "./avatar";
import { Game } from "./game";

export interface Player {
  id: number;
  userName: string;
  avatar: Avatar;
  realname: string;
  summary: string;
  country: string;
  city: string;
  status: FriendStatus;
  type: FriendRequestType;
  created: string;
  lastActive: string;
  publications: Game[];
}
