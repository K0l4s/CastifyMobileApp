import { PodcastResponse } from "../models/PodcastModel";
import { axiosInstance, axiosInstanceAuth, axiosInstanceFile, BaseApi } from "../utils/axiosInstance";

class PodcastService {
  static async getRecentPodcasts(page: number, size: number) {
    try {
      const response = await axiosInstance.get<PodcastResponse>("/api/v1/podcast/recent", {
        params: {
          page,
          size
        }
      });
      response.data.content.forEach(podcast => {
        podcast.videoUrl = `${BaseApi}/api/v1/podcast/video?path=${encodeURIComponent(podcast.videoUrl)}`;
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getPodcastBySelf(page = 0,
    size = 10,
    minViews?: number,
    minComments?: number,
    sortByViews = "asc",
    sortByComments = "asc",
    sortByCreatedDay = "desc") {
    try {
      const response = await axiosInstanceAuth.get<PodcastResponse>(
        "/api/v1/podcast/contents", {
        params: {
          page,
          size,
          minViews,
          minComments,
          sortByViews,
          sortByComments,
          sortByCreatedDay
        }
      });
  
      response.data.content.forEach(podcast => {
        podcast.videoUrl = `${BaseApi}/api/v1/podcast/video?path=${encodeURIComponent(podcast.videoUrl)}`;
      });
  
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getPodcastsByGenre(genreId: string, page: number, size: number) {
    try {
      const response = await axiosInstance.get<PodcastResponse>("/api/v1/podcast/by-genre", {
        params: { genreId: genreId !== "All" ? genreId : undefined, page, size },
      });
  
      response.data.content.forEach(podcast => {
        podcast.videoUrl = `${BaseApi}/api/v1/podcast/video?path=${encodeURIComponent(podcast.videoUrl)}`;
      });
  
      return response.data;
    } catch (error) {
      console.error("Error fetching podcasts by genre:", error);
      throw error;
    }
  }

  static async uploadPodcast(formData: FormData) {
    try {
      const response = await axiosInstanceFile.post("/api/v1/podcast/create", formData);
      return response.data;
    } catch (error: any) {
      console.error("Error uploading podcast:", error.response?.data || error.message);
      throw error;
    }
  }
}
  
export default PodcastService;