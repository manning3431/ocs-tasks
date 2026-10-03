// src/types/task.ts

export type TaskStatus = "Not Started" | "In Progress" | "Blocked" | "Complete" | "Cancelled";

export interface Task {
  taskId: string;
  displayId: string; // human-friendly formatted ID, derived via formatDisplayId util
  description: string;
  owner: string;
  dueDate: string; // ISO 8601 date string
  status: TaskStatus;
  comments?: string;
  assignedEntityId: string;
  assignedEntityName: string; // denormalized for display without extra joins
  assignedEntityTypeId: string;
  assignedEntityTypeName: string; // denormalized for display/grouping (FR5)
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  assignedEntityId: string;
  description: string;
  owner: string;
  dueDate: string;
  status: TaskStatus;
  comments?: string;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  taskId: string;
}

export interface TaskFilters {
  entityTypeId?: string;
  entityId?: string;
  status?: TaskStatus;
  search?: string;
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