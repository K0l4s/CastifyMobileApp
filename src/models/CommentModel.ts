import { UserSimple } from "./User";

export interface Comment {
  id: string;
  parentId: string;
  content: string;
  mentionedUser: string;
  totalLikes: number;
  totalReplies: number;
  timestamp: string;
  user: UserSimple;
  liked: boolean;
  replies?: Comment[];
}