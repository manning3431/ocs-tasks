// src/types/entities.ts

export interface EntityOut {
  entity_id: string;
  entity_name: string;
  entity_slug?: string | null;
}

export interface EntitiesGroupedResponse {
  success: boolean;
  data: Record<string, EntityOut[]>;
}