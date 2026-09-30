// src/services/entityService.ts

import { apiClient } from './apiClient';
import type { EntitiesGroupedResponse } from '../types/entities';

const ENTITIES_BASE_URL = import.meta.env.VITE_ENTITIES_API_BASE_URL ?? '/api/entities';

export const entityService = {
  async getGroupedEntities(): Promise<EntitiesGroupedResponse> {
    return apiClient.get<EntitiesGroupedResponse>('/v1/entity_list', {
      baseUrl: ENTITIES_BASE_URL,
    });
  },
};