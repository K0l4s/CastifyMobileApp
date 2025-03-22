import { axiosInstanceAuth } from "../utils/axiosInstance";

export const NotificationService = {
    getTotalUnRead: async () => {
        return axiosInstanceAuth.get(`/api/v1/notification/read`);
    },
    getAllNotification: async (pageNumber:number,pageSize:number) => {
        return axiosInstanceAuth.get(`/api/v1/notification?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    },
    readNoti: async (id:string) => {
        return axiosInstanceAuth.put(`/api/v1/notification/read?id=`+id);
    },
    readAllNoti: async () => {
        return axiosInstanceAuth.put(`/api/v1/notification/read/all`);
    },
}