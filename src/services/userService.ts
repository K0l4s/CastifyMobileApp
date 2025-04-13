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
      const response = await axiosInstance.get<PodcastResponse>(`/api/v1/search/post?pageNumber=${pageNumber}&pageSize=${pageSize}&keyword=${keyword}`);
      response.data.content.forEach(podcast => {
        podcast.videoUrl = `${BaseApi}/api/v1/podcast/video?path=${encodeURIComponent(podcast.videoUrl)}`;
      });
      return response.data;
    } catch (error) {
      console.error("Error searching podcasts:", error);
      throw error;
    }
  }

  static async getUserByUsername(username: string) {
    try {
      const response = await axiosInstance.get(`/api/v1/user?username=${username}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  }

  static async getFollowingUsers(username: string, pageNumber: number = 0, pageSize: number = 10) {
    try {
      const response = await axiosInstanceAuth.get("/api/v1/user/list/following", {
        params: {
          username,
          pageNumber,
          pageSize
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  //Tinh nang dang phat trien
  static async unfollowUser(userId: string) {
    try {
      const response = await axiosInstanceAuth.delete(`/api/v1/user/unfollow/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default UserService;