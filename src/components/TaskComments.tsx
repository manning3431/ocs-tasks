// src/components/TaskComments.tsx

import type { KeyboardEvent } from 'react';
import type { CommentOut } from '../types/comments';
import type { ActorOut } from '../types/actors';
import { ActorSelect } from './ActorSelect';

interface TaskCommentsProps {
  comments: CommentOut[];
  loading: boolean;
  loadError: string | null;
  draft: string;
  onDraftChange: (value: string) => void;
  onAdd: () => void;
  posting: boolean;
  disabled?: boolean;
  actors: ActorOut[];
  actorsLoading: boolean;
  authorId: string;
  onAuthorChange: (actorId: string) => void;
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function TaskComments({
  comments,
  loading,
  loadError,
  draft,
  onDraftChange,
  onAdd,
  posting,
  disabled = false,
  actors,
  actorsLoading,
  authorId,
  onAuthorChange,
}: TaskCommentsProps) {
  const canPost = !posting && !disabled && draft.trim().length > 0;

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && canPost) {
      e.preventDefault();
      onAdd();
    }
  };

  return (
    <section aria-labelledby="comments-heading" className="pt-4 border-t border-surface-200 space-y-3">
      <div className="flex items-center justify-between">
        <h4 id="comments-heading" className="text-sm font-semibold text-surface-900">
          Comments{comments.length > 0 ? ` (${comments.length})` : ''}
        </h4>
      </div>

      <div className="space-y-2">
        <label htmlFor="new-comment" className="sr-only">
          New comment
        </label>
        <textarea
          id="new-comment"
          rows={2}
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment... (Ctrl+Enter to post)"
          disabled={posting || disabled}
          className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-surface-900 resize-y"
        />
        <div className="flex items-end justify-between gap-3">
          <div className="flex-1 max-w-xs">
            <label htmlFor="comment-author" className="block text-xs text-surface-500 mb-1">
              Posting as
            </label>
            <ActorSelect
              id="comment-author"
              actors={actors}
              value={authorId}
              onChange={onAuthorChange}
              disabled={posting || disabled}
              loading={actorsLoading}
            />
          </div>
          <button
            type="button"
            onClick={onAdd}
            disabled={!canPost}
            className="px-3 py-2 text-sm font-medium rounded-lg border border-surface-300 text-surface-700 bg-white hover:bg-surface-50 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {posting ? 'Posting...' : 'Add Comment'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-surface-500 py-2">Loading comments...</div>
      ) : loadError ? (
        <div className="text-sm text-red-600 py-1">{loadError}</div>
      ) : comments.length === 0 ? (
        <div className="text-sm text-surface-500 py-2">No comments yet.</div>
      ) : (
        <ul className="space-y-3 max-h-56 overflow-y-auto pr-1">
          {comments.map((c) => {
            const name = c.actor_name?.trim() || 'Unknown';
            return (
              <li key={c.comment_id} className="flex gap-3">
                <div
                  className="flex-none w-8 h-8 rounded-full bg-surface-100 text-surface-600 text-xs font-semibold flex items-center justify-center"
                  aria-hidden="true"
                >
                  {initialsOf(name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm font-medium text-surface-900">{name}</span>
                    <time dateTime={c.created_at} className="text-xs text-surface-500">
                      {formatTimestamp(c.created_at)}
                    </time>
                  </div>
                  <p className="text-sm text-surface-700 whitespace-pre-wrap break-words">
                    {c.comment}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}