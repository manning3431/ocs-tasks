// src/services/taskService.ts

import { apiClient } from './apiClient';
import type {
  TaskCreateRequest,
  TaskResponse,
  TasksResponse,
} from '../types/task';

// Reads tasks-specific base URL, falls back to /api/tasks or /api
const TASKS_BASE_URL =
  import.meta.env.VITE_TASKS_API_BASE_URL ??
  (import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/tasks` : '/api');

export interface TaskFilterParams {
  entity_id?: string;
  status_code?: string;
}

export const taskService = {
  async getTasks(params?: TaskFilterParams): Promise<TasksResponse> {
    const query = new URLSearchParams();
    if (params?.entity_id) {
      query.set('entity_id', params.entity_id);
    }
    if (params?.status_code) {
      query.set('status_code', params.status_code);
    }
    const queryString = query.toString();
    const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
    return apiClient.get<TasksResponse>(endpoint, {
      baseUrl: TASKS_BASE_URL,
    });
  },

  async createTask(payload: TaskCreateRequest): Promise<TaskResponse> {
    return apiClient.post<TaskResponse>('/tasks', payload, {
      baseUrl: TASKS_BASE_URL,
    });
  },
};