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