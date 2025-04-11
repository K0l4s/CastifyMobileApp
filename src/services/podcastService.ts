import { Podcast, PodcastResponse } from "../models/PodcastModel";
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

  static async getUserPodcasts(
    username: string,
    page = 0,
    size = 10,
    sortBy: 'newest' | 'oldest' | 'views' = 'newest'
  ) {
    try {
      const response = await axiosInstance.get<PodcastResponse>(
        `/api/v1/podcast/user/${username}`, {
        params: {
          page,
          size,
          sortBy
        }
      });
  
      response.data.content.forEach(podcast => {
        podcast.videoUrl = `${BaseApi}/api/v1/podcast/video?path=${encodeURIComponent(podcast.videoUrl)}`;
      });
  
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  static async likePodcast(podcastId: string) {
    try {
      const response = await axiosInstanceAuth.post(`/api/v1/podcast/reaction`, { podcastId });
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  static async getPodcastByAuth(id: string) {
    try {
      const response = await axiosInstanceAuth.get<Podcast>(`/api/v1/podcast/detail/${id}`);
      response.data.videoUrl = `${BaseApi}/api/v1/podcast/video?path=${encodeURIComponent(response.data.videoUrl)}`;
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  static async getPodcastByAnonymous(id: string) {
    try {
      const response = await axiosInstance.get<Podcast>(`/api/v1/podcast/anonymous/${id}`);
      response.data.videoUrl = `${BaseApi}/api/v1/podcast/video?path=${encodeURIComponent(response.data.videoUrl)}`;
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  static async getPodcastById(id: string) {
    try {
      const response = await axiosInstanceAuth.get<Podcast>(`/api/v1/podcast/${id}`);
      response.data.videoUrl = `${BaseApi}/api/v1/podcast/video?path=${encodeURIComponent(response.data.videoUrl)}`;
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  static async incrementPodcastViews(podcastId: string) {
    try {
      const response = await axiosInstance.post(`/api/v1/podcast/${podcastId}/inc-views`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  static async getFollowingPodcast(page: number, size: number) {
    try {
      const response = await axiosInstanceAuth.get<PodcastResponse>("/api/v1/podcast/following", {
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
  };

  static async getSuggestedPodcastsByGenres(
    id: string,
    genreIds: string[],
    page = 0,
    size = 5
  ) {
    try {
      const response = await axiosInstance.get<PodcastResponse>(
        `/api/v1/podcast/suggested-by-genres/${id}`, {
        params: {
          genreIds: genreIds.join(','),
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
  };
}
  
export default PodcastService;