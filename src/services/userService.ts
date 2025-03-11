import { updateUser } from "../models/User";
import { PodcastResponse } from "../models/PodcastModel";
import { userCard } from "../models/User";
import { axiosInstance, axiosInstanceAuth, axiosInstanceFile, BaseApi } from "../utils/axiosInstance";

class UserService {
  static async getUserByToken() {
    try {
      const response = await axiosInstanceAuth.get("/api/v1/user/auth");
      return response.data;
    } catch (err: any) {
      console.error("Get user error:", err.message);
      throw err;
    }
  }

  static async updateUser(updatedUser: updateUser) {
    return await axiosInstanceAuth.put(`/api/v1/user`, updatedUser);
  }

  static async changeAvatar(avatar: File) {
    const formData = new FormData();
    formData.append('avatar', avatar);
    return await axiosInstanceFile.put(`/api/v1/user/avatar`, formData);
  }

  
  // static async searchPodcasts(keyword: string, pageNumber = 0, pageSize = 10) {
  //   try {
  //     const response = await axiosInstance.get<PodcastResponse>("/api/v1/search/post", {
  //       params: {
  //         pageNumber,
  //         pageSize,
  //         keyword
  //       }
  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error searching podcasts:", error);
  //     throw error;
  //   }
  // }

  // static async searchUsers(keyword: string, pageNumber = 0, pageSize = 10) {
  //   // try {
  //     // const response = await axiosInstance.get<userCard>("/api/v1/search/user", {
  //     //   params: {
  //     //     pageNumber,
  //     //     pageSize,
  //     //     keyword
  //     //   }
  //     return axiosInstance.get(`/api/v1/search/user?pageNumber=${pageNumber}&pageSize=${pageSize}&keyword=${keyword}`);
  //   //   });
  //   //   return response.data;
  //   // } catch (error) {
  //   //   console.error("Error searching users:", error);
  //   //   throw error;
  //   // }
  // }
  
  static async searchUsers(keyword: string, pageNumber = 0, pageSize = 10) {
    try {
      const response = await axiosInstance.get(`/api/v1/search/user?pageNumber=${pageNumber}&pageSize=${pageSize}&keyword=${keyword}`);
      return response.data;
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  }

  static async searchPodcasts(keyword: string, pageNumber = 0, pageSize = 10) {
    try {
      const response = await axiosInstance.get(`/api/v1/search/post?pageNumber=${pageNumber}&pageSize=${pageSize}&keyword=${keyword}`);
      return response.data;
    } catch (error) {
      console.error("Error searching podcasts:", error);
      throw error;
    }
  }
}

export default UserService;