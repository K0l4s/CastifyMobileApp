import { shortUser } from "./User";

export interface NotiModel{
    id: string;
    title: string;
    content: string;
    createdAt: string;
    targetUrl: string;
    type: string;
    sender: shortUser;
    receiverId: string;
    read: boolean;
} 