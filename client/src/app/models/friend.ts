import { FriendStatus } from "../helpers/friendStatus";
import { Player } from "./player";

export interface Friend {
	player: Player;
	status: FriendStatus;
}