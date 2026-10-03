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

export interface EntityType {
  entityTypeId: string;
  entityTypeName: string; // e.g. "Programme", "Value Chain", "Workstream", "Project"
}

export interface Entity {
  entityId: string;
  entityName: string;
  entityTypeId: string;
}

export interface EntityRelationship {
  parentEntityId: string;
  childEntityId: string;
}