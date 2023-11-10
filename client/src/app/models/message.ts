import { Avatar } from "./avatar"

export interface Message {
  id: number;
  senderId: number;
  senderUsername: string;
  senderAvatar: Avatar;
  recipientId: number;
  recipientUsername: string;
  recipientAvatar: Avatar;
  content: string;
  messageSent: Date;
  messageRead?: Date;
}