// Generic entity hierarchy types. No entity type is hardcoded here —
// entity types are data-driven (entities.entity_type) so future types
// (Initiative, Capability, Product, etc.) require zero code changes (FR7).

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