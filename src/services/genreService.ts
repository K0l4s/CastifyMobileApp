import { axiosInstance } from "../utils/axiosInstance";

class GenreService {
  static async getGenres() {
    try {
      const response = await axiosInstance.get('/api/v1/genre/names');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default GenreService;