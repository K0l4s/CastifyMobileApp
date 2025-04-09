import { CreateConversationProps } from "../models/Conversation";
import { axiosInstanceAuth, axiosInstanceFile } from "../utils/axiosInstance";

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
    },
    getDetailChat(conversationId: string) {
        return axiosInstanceAuth.get(`/api/v1/conversation/msg/detail?groupId=${conversationId}`);
    },
    getMembers(conversationId: string) {
        return axiosInstanceAuth.get(`/api/v1/conversation/msg/members?groupId=${conversationId}`);
    },
    readMsg(conversationId: string) {
        return axiosInstanceAuth.put(`/api/v1/conversation/msg/read?groupId=${conversationId}`)
    },
    hasUnreadMsg() {
        return axiosInstanceAuth.get(`/api/v1/conversation/isUnread`)
    },
    changeImage: async (imgFile: File,groupId:string) => {
        const formData = new FormData();
        formData.append('imageFile', imgFile);
        return await axiosInstanceFile.put(`/api/v1/conversation/msg/avt?groupId=${groupId}`, formData);
    },
    changeTitle: async (title: string, groupId: string) => {
        return await axiosInstanceAuth.put(`/api/v1/conversation/msg/title?groupId=${groupId}&title=${title}`);
    },
    addMembers: async (userId: string[], groupId: string) => {
        return await axiosInstanceAuth.post(`/api/v1/conversation/member/add?groupId=${groupId}`, userId);
    },
    deleteMembers: async (userId: string, groupId: string) => {
        return await axiosInstanceAuth.delete(`/api/v1/conversation/member/del?groupId=${groupId}&memberId=${userId}`);
    }
}