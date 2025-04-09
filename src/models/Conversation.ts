import { shortUser } from "./User";
export interface MemberInfor {
    memberId: string;
    role: string;
    joinTime: string;
    isAccepted: boolean;

}
export interface CreateConversationProps {
    title: string;
    // name: string;
    memberList: MemberInfor[];
}
export interface Message {
    id: string;
    sender: shortUser;
    content: string;
    timestamp: string;
    status?: "sending" | "sent" | "seen";
    read?: boolean;
}
export interface shortConversation {
    id: string;
    title: string;
    imageUrl: string;
    memberSize: number;
    lastMessage?: Message;
    // lastMessage: string;
    // lastMessageTimestamp: string;
}

export interface ConversationDetail {
    id: string;
    title: string;
    imageUrl: string;
    memberSize: number;
    memberList: MemberInfor[];
    createdAt: string;
    active: boolean;
}
export interface LastReadMessage{
    lastMessageId: string;
    lastReadTime: string;
}
export interface FullMemberInfor {
    members: shortUser;
    role: string;
    joinTime: string;
    lastReadMessage: LastReadMessage;
}