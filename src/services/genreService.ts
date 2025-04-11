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


  static async getGenresByList(genreIds: string[]) {
    try {
      const response = await axiosInstance.post('/api/v1/genre/namesByList', genreIds);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
}

export default GenreService;