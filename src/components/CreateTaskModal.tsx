// src/components/CreateTaskModal.tsx

import React, { useEffect, useState } from 'react';
import { Button, Input } from '@pmo/design-system';
import type { EntityOut, TaskCreateRequest, TaskOut } from '../types/task';
import { taskService } from '../services/taskService';
import { entityService } from '../services/entityService';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (createdTask: TaskOut) => void;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onTaskCreated,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [entityId, setEntityId] = useState('');
  const [statusCode, setStatusCode] = useState('active');
  const [dueDate, setDueDate] = useState('');
  
  const [groupedEntities, setGroupedEntities] = useState<Record<string, EntityOut[]>>({});
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [entityFetchError, setEntityFetchError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch entities from the entities microservice when the modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadEntities() {
      setLoadingEntities(true);
      setEntityFetchError(null);
      try {
        const response = await entityService.getGroupedEntities();
        if (isMounted) {
          if (response.success && response.data) {
            setGroupedEntities(response.data);
            // Default select the first entity
            for (const group of Object.values(response.data)) {
              if (group.length > 0) {
                setEntityId(group[0].entity_id);
                break;
              }
            }
          } else {
            setEntityFetchError('Received invalid response from entity service.');
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to load entities';
          setEntityFetchError(msg);
        }
      } finally {
        if (isMounted) {
          setLoadingEntities(false);
        }
      }
    }

    loadEntities();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!entityId) {
      setError('Please select an entity.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload: TaskCreateRequest = {
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
      entity_id: entityId,
      status_code: statusCode,
      due_date: dueDate ? dueDate : null,
      owner_actor_id: null,
    };

    try {
      const response = await taskService.createTask(payload);
      if (response.success && response.data) {
        onTaskCreated(response.data);
        onClose();
        setTitle('');
        setDescription('');
        setDueDate('');
        setStatusCode('active');
      } else {
        setError('Failed to create task.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const hasEntities = Object.keys(groupedEntities).length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-surface-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-200 flex items-center justify-between">
          <h3 id="modal-title" className="text-lg font-semibold text-surface-900">
            Create Task
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-surface-400 hover:text-surface-600 focus:outline-none p-1 rounded-md"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design new dashboard layout"
              disabled={submitting}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Entity / Project <span className="text-red-500">*</span>
            </label>
            {loadingEntities ? (
              <div className="text-sm text-surface-500 py-2">Loading entities from service...</div>
            ) : entityFetchError ? (
              <div className="text-sm text-red-600 py-1">
                {entityFetchError}. Check entities service endpoint.
              </div>
            ) : (
              <select
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                disabled={submitting || !hasEntities}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-surface-900"
              >
                {!hasEntities ? (
                  <option value="">No entities available</option>
                ) : (
                  Object.entries(groupedEntities).map(([groupName, items]) => (
                    <optgroup key={groupName} label={groupName}>
                      {items.map((item) => (
                        <option key={item.entity_id} value={item.entity_id}>
                          {item.entity_name}
                        </option>
                      ))}
                    </optgroup>
                  ))
                )}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                Status
              </label>
              <select
                value={statusCode}
                onChange={(e) => setStatusCode(e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-surface-900"
              >
                <option value="active">Active / In Progress</option>
                <option value="todo">To Do</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-surface-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details or context..."
              disabled={submitting}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-surface-900 resize-y"
            />
          </div>

          <div className="pt-4 border-t border-surface-200 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting || loadingEntities || !hasEntities}
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}