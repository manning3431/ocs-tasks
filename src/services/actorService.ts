// src/services/actorService.ts

import { apiClient } from './apiClient';
import type { ActorsResponse } from '../types/actors';

const ENTITIES_BASE_URL = import.meta.env.VITE_ENTITIES_API_BASE_URL ?? '/api/entities';

export const actorService = {
  async getActors(): Promise<ActorsResponse> {
    return apiClient.get<ActorsResponse>('/v1/actors/actor_list', {
      baseUrl: ENTITIES_BASE_URL,
    });
  },
};