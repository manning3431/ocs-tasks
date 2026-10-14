// src/types/comments.ts

export interface CommentOut {
  comment_id: string;
  task_id: string;
  comment: string | null;
  owner_actor_id?: string | null;
  actor_name?: string | null;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentCreateRequest {
  comment: string;
  owner_actor_id?: string | null;
}

export interface CommentsResponse {
  success: boolean;
  data: CommentOut[];
}

export interface CommentResponse {
  success: boolean;
  data: CommentOut;
}