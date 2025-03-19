import { axiosInstance, axiosInstanceAuth } from "../utils/axiosInstance";

interface AddCommentPayload {
  podcastId: string;
  content: string;
  parentId?: string;
  mentionedUser?: string;
}

class CommentService {
  static async getCommentsByPodcast(podcastId: string, page: number, size: number, 
      sortBy = 'latest', isAuthenticated = false) {
    try {
      const axiosInstanceToUse = isAuthenticated ? axiosInstanceAuth : axiosInstance;
      const response = await axiosInstanceToUse.get(`/api/v1/comment/list/${podcastId}`, {
        params: {
          page,
          size,
          sortBy,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error uploading podcast:", error.response?.data || error.message);
      throw error;
    }
  };

  static async addComment(payload: AddCommentPayload) {
    try {
      const response = await axiosInstanceAuth.post("/api/v1/comment/add", payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  static async getCommentReplies(commentId: string, isAuthenticated = false) {
    try {
      const axiosInstanceToUse = isAuthenticated ? axiosInstanceAuth : axiosInstance;
      const response = await axiosInstanceToUse.get(`/api/v1/comment/list/replies/${commentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  static async likeComment(commentId: string) {
    try {
      const response = await axiosInstanceAuth.post("/api/v1/comment/reaction", { commentId });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  static async deleteComment(commentIds: string[]) {
    try {
      const response = await axiosInstanceAuth.delete("/api/v1/comment/delete", {
        data: commentIds,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };
}

export default CommentService;