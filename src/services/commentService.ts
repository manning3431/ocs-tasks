// src/services/commentService.ts

import { apiClient } from './apiClient';
import type {
  CommentCreateRequest,
  CommentResponse,
  CommentsResponse,
} from '../types/comments';

const TASKS_BASE_URL = import.meta.env.VITE_TASKS_API_BASE_URL ?? '/api/tasks';

export const commentService = {
  async getComments(taskId: string): Promise<CommentsResponse> {
    return apiClient.get<CommentsResponse>(`/v1/task/${taskId}/comments`, {
      baseUrl: TASKS_BASE_URL,
    });
  },

  async createComment(
    taskId: string,
    payload: CommentCreateRequest,
  ): Promise<CommentResponse> {
    return apiClient.post<CommentResponse>(`/v1/task/${taskId}/comments`, payload, {
      baseUrl: TASKS_BASE_URL,
    });
  },
};