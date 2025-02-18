import { CreateConversationProps } from "../models/Conversation";
import { axiosInstanceAuth } from "../utils/axiosInstance";

export const conversationService = {
    createConversation: async (data: CreateConversationProps) => {
        return axiosInstanceAuth.post('/api/v1/conversation/', data);
    },
    getByUserId: async (pageNumber: number, pageSize: number) => {
        return axiosInstanceAuth.get(`/api/v1/conversation?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    },
    getMsgByConversationId: async (conversationId: string, pageNumber: number, pageSize: number) => {
        return axiosInstanceAuth.get(`/api/v1/conversation/msg?groupId=${conversationId}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
    },
    sendMessage: async (data: string, groupId: string) => {
        return axiosInstanceAuth.put('/api/v1/conversation/msg?groupId=' + groupId, { message: data });
    }
}