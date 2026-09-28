// src/services/entityService.ts

import { apiClient } from './apiClient';
import type { EntitiesGroupedResponse } from '../types/task';

// Reads entity-specific base URL, falls back to /api/entities or /api
const ENTITIES_BASE_URL =
  import.meta.env.VITE_ENTITIES_API_BASE_URL ??
  (import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/entities` : '/api');

export const entityService = {
  async getGroupedEntities(): Promise<EntitiesGroupedResponse> {
    return apiClient.get<EntitiesGroupedResponse>('/entities', {
      baseUrl: ENTITIES_BASE_URL,
    });
  },
};