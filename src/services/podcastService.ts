import { PodcastResponse } from "../models/PodcastModel";
import { axiosInstance, BaseApi } from "../utils/axiosInstance";

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
}

export default PodcastService;