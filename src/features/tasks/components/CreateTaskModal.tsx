import { FormEvent, useEffect, useState } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { Card } from "./Card";
import type { EntityType, Entity } from "../types/entity";
import type { CreateTaskPayload, TaskStatus } from "../types/task";
import { TASK_STATUS_OPTIONS } from "../utils/taskStatusColors";

interface CreateTaskModalProps {
  open: boolean;
  entityTypes: EntityType[];
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload) => Promise<void>;
  onEntityTypeChange: (entityTypeId: string) => Promise<void> | void;
  entitiesForSelectedType: Entity[];
}

interface FormState {
  entityTypeId: string;
  entityId: string;
  description: string;
  owner: string;
  dueDate: string;
  status: TaskStatus;
  comments: string;
}

const EMPTY_FORM: FormState = {
  entityTypeId: "",
  entityId: "",
  description: "",
  owner: "",
  dueDate: "",
  status: "Not Started",
  comments: "",
};

export function CreateTaskModal({
  open,
  entityTypes,
  onClose,
  onSubmit,
  onEntityTypeChange,
  entitiesForSelectedType,
}: CreateTaskModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      setFormError(null);
    }
  }, [open]);

  if (!open) return null;

  const handleEntityTypeChange = async (entityTypeId: string) => {
    setForm((prev) => ({ ...prev, entityTypeId, entityId: "" }));
    await onEntityTypeChange(entityTypeId);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    // FR4 mandatory fields: Assigned Entity, Description, Owner, Due Date, Status.
    if (!form.entityId || !form.description.trim() || !form.owner.trim() || !form.dueDate || !form.status) {
      setFormError("Please complete all mandatory fields: Assigned Entity, Description, Owner, Due Date, and Status.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        assignedEntityId: form.entityId,
        description: form.description.trim(),
        owner: form.owner.trim(),
        dueDate: form.dueDate,
        status: form.status,
        comments: form.comments.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create task.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <Card className="w-full max-w-lg" padded>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">New task</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Assignment level <span className="text-rose-500">*</span>
            </label>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={form.entityTypeId}
              onChange={(e) => handleEntityTypeChange(e.target.value)}
              required
            >
              <option value="">Select assignment level</option>
              {entityTypes.map((type) => (
                <option key={type.entityTypeId} value={type.entityTypeId}>
                  {type.entityTypeName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Assigned entity <span className="text-rose-500">*</span>
            </label>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-50"
              value={form.entityId}
              onChange={(e) => setForm((prev) => ({ ...prev, entityId: e.target.value }))}
              disabled={!form.entityTypeId}
              required
            >
              <option value="">
                {form.entityTypeId ? "Select entity" : "Select an assignment level first"}
              </option>
              {entitiesForSelectedType.map((entity) => (
                <option key={entity.entityId} value={entity.entityId}>
                  {entity.entityName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Description <span className="text-rose-500">*</span>
            </label>
            <Input
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the task"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Owner <span className="text-rose-500">*</span>
              </label>
              <Input
                value={form.owner}
                onChange={(e) => setForm((prev) => ({ ...prev, owner: e.target.value }))}
                placeholder="Task owner"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Due date <span className="text-rose-500">*</span>
              </label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Status <span className="text-rose-500">*</span>
            </label>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as TaskStatus }))}
              required
            >
              {TASK_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Comments</label>
            <textarea
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              rows={3}
              value={form.comments}
              onChange={(e) => setForm((prev) => ({ ...prev, comments: e.target.value }))}
              placeholder="Optional comments"
            />
          </div>

          {formError && <p className="text-sm text-rose-600">{formError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Creating..." : "Create task"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}