import { apiClient } from "../../../services/apiClient";
import type { Task, CreateTaskPayload, UpdateTaskPayload } from "../types/task";
import type { EntityType, Entity, EntityRelationship } from "../types/entity";

// FR2: Assignment Level dropdown source — entities.entity_type, no hardcoded list.
export function fetchEntityTypes(): Promise<EntityType[]> {
  return apiClient.get<EntityType[]>("/entities/types");
}

// FR3: Assigned Entity dropdown, filtered by selected entity type.
export function fetchEntitiesByType(entityTypeId: string): Promise<Entity[]> {
  const params = new URLSearchParams({ entity_type_id: entityTypeId });
  return apiClient.get<Entity[]>(`/entities?${params.toString()}`);
}

// FR6: Hierarchy edges for roll-up reporting.
export function fetchEntityRelationships(): Promise<EntityRelationship[]> {
  return apiClient.get<EntityRelationship[]>("/entities/relationships");
}

// FR5: Tasks reportable/filterable by entity type and entity.
export function fetchTasks(params?: {
  entityTypeId?: string;
  entityId?: string;
  status?: string;
  search?: string;
}): Promise<Task[]> {
  const query = new URLSearchParams();
  if (params?.entityTypeId) query.set("entity_type_id", params.entityTypeId);
  if (params?.entityId) query.set("entity_id", params.entityId);
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  const qs = query.toString();
  return apiClient.get<Task[]>(`/tasks${qs ? `?${qs}` : ""}`);
}

// FR4: Task creation, mandatory fields enforced at the form layer.
export function createTask(payload: CreateTaskPayload): Promise<Task> {
  return apiClient.post<Task>("/tasks", payload);
}

export function updateTask(payload: UpdateTaskPayload): Promise<Task> {
  const { taskId, ...rest } = payload;
  return apiClient.put<Task>(`/tasks/${taskId}`, rest);
}

export function deleteTask(taskId: string): Promise<void> {
  return apiClient.delete<void>(`/tasks/${taskId}`);
}