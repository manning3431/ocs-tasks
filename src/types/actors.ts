// src/types/actors.ts

export interface ActorOut {
  actor_id: string;
  actor_name: string;
  email?: string | null;
}

export interface ActorsResponse {
  success: boolean;
  data: ActorOut[];
}