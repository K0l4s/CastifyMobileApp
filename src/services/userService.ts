import { axiosInstanceAuth } from "../utils/axiosInstance";

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
}

export default UserService;