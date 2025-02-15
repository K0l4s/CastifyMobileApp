import { updateUser } from "../models/User";
import { axiosInstanceAuth, axiosInstanceFile } from "../utils/axiosInstance";

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
}

export default UserService;