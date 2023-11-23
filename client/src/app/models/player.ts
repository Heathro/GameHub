import { FriendRequestType } from "../helpers/friendRequestType";
import { FriendStatus } from "../helpers/friendStatus";
import { Avatar } from "./avatar";

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
}
