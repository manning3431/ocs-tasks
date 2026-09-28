// src/types/task.ts

export interface EntityOut {
  entity_id: string;
  entity_name: string;
  entity_slug?: string | null;
}

export interface EntitiesGroupedResponse {
  success: boolean;
  data: Record<string, EntityOut[]>;
}

export interface TaskOut {
  task_id: string;
  display_id: string;
  entity_name: string;
  title: string;
  description?: string | null;
  owner_actor_id?: string | null;
  status_code: string;
  status_label: string;
  due_date?: string | null;
  updated_at: string;
}

export interface TasksResponse {
  success: boolean;
  data: TaskOut[];
}

export interface TaskCreateRequest {
  entity_id: string;
  title: string;
  description?: string | null;
  owner_actor_id?: string | null;
  due_date?: string | null;
  status_code?: string;
}

export interface TaskResponse {
  success: boolean;
  data: TaskOut;
}