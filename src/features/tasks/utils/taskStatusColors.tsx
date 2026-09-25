import type { TaskStatus } from "../types/task";

// Maps Task.status to the shell's fixed StatusBadgeColor enum.
// StatusBadge does not accept raw status strings — this mapping is required
// per component_contracts_v1.md (StatusBadge note).
type StatusBadgeColor = "green" | "amber" | "red" | "grey" | "blue";

const STATUS_COLOR_MAP: Record<TaskStatus, StatusBadgeColor> = {
  "Not Started": "grey",
  "In Progress": "blue",
  "Blocked": "red",
  "Complete": "green",
  "Cancelled": "amber",
};

export function getTaskStatusColor(status: TaskStatus): StatusBadgeColor {
  return STATUS_COLOR_MAP[status] ?? "grey";
}

export const TASK_STATUS_OPTIONS: TaskStatus[] = [
  "Not Started",
  "In Progress",
  "Blocked",
  "Complete",
  "Cancelled",
];