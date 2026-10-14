// src/components/CreateTaskModal.tsx

import React, { useEffect, useState } from 'react';
import { Button, Input } from '@pmo/design-system';
import type { TaskCreateRequest, TaskOut } from '../types/task';
import type { EntityOut } from '../types/entities';
import type { ActorOut } from '../types/actors';
import type { CommentOut } from '../types/comments';
import { taskService } from '../services/taskService';
import { entityService } from '../services/entityService';
import { actorService } from '../services/actorService';
import { commentService } from '../services/commentService';
import { ActorSelect } from './ActorSelect';
import { TaskComments } from './TaskComments';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (createdTask: TaskOut) => void;
  /** When provided, the modal opens in edit mode for this task. */
  task?: TaskOut | null;
  onTaskUpdated?: (updatedTask: TaskOut) => void;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'active', label: 'Active / In Progress' },
  { value: 'todo', label: 'To Do' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

const COMMENT_AUTHOR_STORAGE_KEY = 'pmo.tasks.commentAuthorId';

function readStoredAuthorId(): string {
  try {
    return window.localStorage.getItem(COMMENT_AUTHOR_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function storeAuthorId(actorId: string): void {
  try {
    if (actorId) {
      window.localStorage.setItem(COMMENT_AUTHOR_STORAGE_KEY, actorId);
    } else {
      window.localStorage.removeItem(COMMENT_AUTHOR_STORAGE_KEY);
    }
  } catch {
    // Storage unavailable; selection simply won't persist
  }
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onTaskCreated,
  task = null,
  onTaskUpdated,
}: CreateTaskModalProps) {
  const isEditMode = !!task;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [entityId, setEntityId] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [statusCode, setStatusCode] = useState('active');
  const [dueDate, setDueDate] = useState('');

  const [groupedEntities, setGroupedEntities] = useState<Record<string, EntityOut[]>>({});
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [entityFetchError, setEntityFetchError] = useState<string | null>(null);

  const [actors, setActors] = useState<ActorOut[]>([]);
  const [loadingActors, setLoadingActors] = useState(false);
  const [actorFetchError, setActorFetchError] = useState<string | null>(null);

  const [comments, setComments] = useState<CommentOut[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [commentAuthorId, setCommentAuthorId] = useState<string>(readStoredAuthorId);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const taskId = task?.task_id ?? null;
  const taskEntityName = task?.entity_name ?? null;

  // Populate / reset form fields whenever the modal opens or the target task changes
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setCommentDraft('');
    if (task) {
      setTitle(task.title ?? '');
      setDescription(task.description ?? '');
      setStatusCode(task.status_code ?? 'active');
      setDueDate(task.due_date ? task.due_date.slice(0, 10) : '');
      setOwnerId(task.owner_actor_id ?? '');
    } else {
      setTitle('');
      setDescription('');
      setStatusCode('active');
      setDueDate('');
      setOwnerId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, taskId]);

  // Load entities and choose the initial selection
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function fetchEntities() {
      setLoadingEntities(true);
      setEntityFetchError(null);
      try {
        const response = await entityService.getGroupedEntities();
        if (isMounted) {
          if (response && response.success && response.data) {
            setGroupedEntities(response.data);

            let selected = '';
            if (taskEntityName) {
              for (const group of Object.values(response.data)) {
                const match = group.find((item) => item.entity_name === taskEntityName);
                if (match) {
                  selected = match.entity_id;
                  break;
                }
              }
            }
            if (!selected && !taskEntityName) {
              for (const group of Object.values(response.data)) {
                if (group.length > 0) {
                  selected = group[0].entity_id;
                  break;
                }
              }
            }
            setEntityId(selected);
          } else {
            setEntityFetchError('Invalid response structure received from entities service.');
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : 'Failed to connect to entities service.';
          setEntityFetchError(message);
        }
      } finally {
        if (isMounted) {
          setLoadingEntities(false);
        }
      }
    }

    fetchEntities();

    return () => {
      isMounted = false;
    };
  }, [isOpen, taskEntityName]);

  // Load actors for the owner and comment-author dropdowns
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function fetchActors() {
      setLoadingActors(true);
      setActorFetchError(null);
      try {
        const response = await actorService.getActors();
        if (isMounted) {
          if (response && response.success && Array.isArray(response.data)) {
            setActors(response.data);
          } else {
            setActorFetchError('Invalid response structure received from actors service.');
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Failed to load actors.';
          setActorFetchError(message);
        }
      } finally {
        if (isMounted) {
          setLoadingActors(false);
        }
      }
    }

    fetchActors();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Load comment history (edit mode only)
  useEffect(() => {
    if (!isOpen || !taskId) {
      setComments([]);
      setCommentsError(null);
      return;
    }

    let isMounted = true;
    async function fetchComments(id: string) {
      setLoadingComments(true);
      setCommentsError(null);
      try {
        const response = await commentService.getComments(id);
        if (isMounted) {
          if (response && response.success && Array.isArray(response.data)) {
            const sorted = [...response.data].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
            );
            setComments(sorted);
          } else {
            setCommentsError('Invalid response structure received from comments service.');
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Failed to load comments.';
          setCommentsError(message);
        }
      } finally {
        if (isMounted) {
          setLoadingComments(false);
        }
      }
    }

    fetchComments(taskId);

    return () => {
      isMounted = false;
    };
  }, [isOpen, taskId]);

  // Handle escape key (skip events already handled by an inner control such as the actor dropdown)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (e.key === 'Escape' && !submitting && !postingComment) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, postingComment, onClose]);

  if (!isOpen) return null;

  const handleAuthorChange = (actorId: string) => {
    setCommentAuthorId(actorId);
    storeAuthorId(actorId);
  };

  // Returns true when there was nothing to post or the comment was saved
  const postComment = async (): Promise<boolean> => {
    if (!task) return false;
    const text = commentDraft.trim();
    if (!text) return true;

    setPostingComment(true);
    try {
      const response = await commentService.createComment(task.task_id, {
        comment: text,
        owner_actor_id: commentAuthorId ? commentAuthorId : null,
      });
      if (response && response.success && response.data) {
        const created = response.data;
        setComments((prev) => [created, ...prev]);
        setCommentDraft('');
        return true;
      }
      setError('Failed to add comment.');
      return false;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add comment.';
      setError(message);
      return false;
    } finally {
      setPostingComment(false);
    }
  };

  const handleAddComment = async () => {
    setError(null);
    await postComment();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!isEditMode && !entityId) {
      setError('Please select an entity.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (isEditMode && task) {
        // Don't silently drop a typed-but-unposted comment
        if (commentDraft.trim()) {
          const posted = await postComment();
          if (!posted) return;
        }

        const updatePayload: Partial<TaskCreateRequest> = {
          title: title.trim(),
          description: description.trim() ? description.trim() : null,
          status_code: statusCode,
          due_date: dueDate ? dueDate : null,
          owner_actor_id: ownerId ? ownerId : null,
        };
        if (entityId) {
          updatePayload.entity_id = entityId;
        }

        const response = await taskService.updateTask(task.task_id, updatePayload);
        if (response && response.success && response.data) {
          onTaskUpdated?.(response.data);
          onClose();
        } else {
          setError('Failed to update task.');
        }
      } else {
        const payload: TaskCreateRequest = {
          title: title.trim(),
          description: description.trim() ? description.trim() : null,
          entity_id: entityId,
          status_code: statusCode,
          due_date: dueDate ? dueDate : null,
          owner_actor_id: ownerId ? ownerId : null,
        };

        const response = await taskService.createTask(payload);
        if (response && response.success && response.data) {
          onTaskCreated(response.data);
          onClose();
          setTitle('');
          setDescription('');
          setDueDate('');
          setOwnerId('');
          setStatusCode('active');
        } else {
          setError('Failed to create task.');
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save task.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const hasEntities = Object.keys(groupedEntities).length > 0;
  const busy = submitting || postingComment;

  const statusOptions = STATUS_OPTIONS.some((o) => o.value === statusCode)
    ? STATUS_OPTIONS
    : [
        ...STATUS_OPTIONS,
        { value: statusCode, label: task?.status_label ?? statusCode },
      ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-surface-200">
        <div className="px-6 py-4 border-b border-surface-200 flex items-center justify-between">
          <div>
            <h3 id="modal-title" className="text-lg font-semibold text-surface-900">
              {isEditMode ? 'Edit Task' : 'Create Task'}
            </h3>
            {isEditMode && task?.display_id && (
              <p className="text-xs font-mono text-surface-500 mt-0.5">{task.display_id}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
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
              disabled={busy}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Entity / Project {!isEditMode && <span className="text-red-500">*</span>}
            </label>
            {loadingEntities ? (
              <div className="text-sm text-surface-500 py-2">Loading entities...</div>
            ) : entityFetchError ? (
              <div className="text-sm text-red-600 py-1">{entityFetchError}</div>
            ) : (
              <select
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                disabled={busy || !hasEntities}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-surface-900"
              >
                {!hasEntities ? (
                  <option value="">No entities found</option>
                ) : (
                  <>
                    {isEditMode && (
                      <option value="">
                        {entityId ? 'Select entity' : `Unchanged${taskEntityName ? ` (${taskEntityName})` : ''}`}
                      </option>
                    )}
                    {Object.entries(groupedEntities).map(([groupName, items]) => (
                      <optgroup key={groupName} label={groupName}>
                        {items.map((item) => (
                          <option key={item.entity_id} value={item.entity_id}>
                            {item.entity_name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </>
                )}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Status</label>
              <select
                value={statusCode}
                onChange={(e) => setStatusCode(e.target.value)}
                disabled={busy}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-surface-900"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={busy}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-surface-900"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="task-owner"
              className="block text-sm font-medium text-surface-700 mb-1"
            >
              Owner
            </label>
            <ActorSelect
              id="task-owner"
              actors={actors}
              value={ownerId}
              onChange={setOwnerId}
              disabled={busy}
              loading={loadingActors}
              error={actorFetchError}
            />
            {actorFetchError && (
              <p className="mt-1 text-xs text-red-600">{actorFetchError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details or context..."
              disabled={busy}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-surface-900 resize-y"
            />
          </div>

          {isEditMode && (
            <TaskComments
              comments={comments}
              loading={loadingComments}
              loadError={commentsError}
              draft={commentDraft}
              onDraftChange={setCommentDraft}
              onAdd={handleAddComment}
              posting={postingComment}
              disabled={submitting}
              actors={actors}
              actorsLoading={loadingActors}
              authorId={commentAuthorId}
              onAuthorChange={handleAuthorChange}
            />
          )}

          <div className="pt-4 border-t border-surface-200 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={busy || loadingEntities || (!isEditMode && !hasEntities)}
            >
              {submitting
                ? isEditMode
                  ? 'Saving...'
                  : 'Creating...'
                : isEditMode
                  ? 'Save Changes'
                  : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}