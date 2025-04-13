import { axiosInstanceAuth } from "../utils/axiosInstance";

class UserActivityService {
  static async getUserActivities(page: number) {
    try {
      const response = await axiosInstanceAuth.get(`/api/v1/activities/view-podcast?page=${page}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user activities:', error);
      throw error;
    }
  };
  
  static async removeUserActivity(id: string) {
    try {
      const response = await axiosInstanceAuth.delete(`/api/v1/activities/remove/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error removing user activity:', error);
      throw error;
    }
  };
  
  static async removeAllUserActivities() {
    try {
      const response = await axiosInstanceAuth.delete(`/api/v1/activities/remove/all`);
      return response.data;
    } catch (error) {
      console.error('Error removing all user activities:', error);
      throw error;
    }
  };
  
  static async searchUserActivities(title: string) {
    try {
      const response = await axiosInstanceAuth.get(`/api/v1/activities/search`, {
        params: { title }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching user activities:', error);
      throw error;
    }
  };
}

export default UserActivityService;