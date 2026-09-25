import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchTasks,
  fetchEntityTypes,
  fetchEntitiesByType,
  fetchEntityRelationships,
  createTask,
  updateTask,
  deleteTask,
} from "../../services/tasksService";
import type { Task, CreateTaskPayload, TaskStatus } from "../../types/task";
import type { EntityType, Entity, EntityRelationship } from "../../types/entity";

interface UseTasksState {
  tasks: Task[];
  entityTypes: EntityType[];
  entitiesForSelectedType: Entity[];
  relationships: EntityRelationship[];
  loading: boolean;
  error: string | null;
  selectedEntityTypeId: string;
  selectedEntityId: string;
  selectedStatus: TaskStatus | "";
  search: string;
}

export function useTasks() {
  const [state, setState] = useState<UseTasksState>({
    tasks: [],
    entityTypes: [],
    entitiesForSelectedType: [],
    relationships: [],
    loading: true,
    error: null,
    selectedEntityTypeId: "",
    selectedEntityId: "",
    selectedStatus: "",
    search: "",
  });

  const loadEntityTypes = useCallback(async () => {
    try {
      const entityTypes = await fetchEntityTypes();
      setState((prev) => ({ ...prev, entityTypes }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to load entity types.",
      }));
    }
  }, []);

  const loadRelationships = useCallback(async () => {
    try {
      const relationships = await fetchEntityRelationships();
      setState((prev) => ({ ...prev, relationships }));
    } catch {
      // Roll-up is a reporting enhancement (FR6); do not block the page on this call.
    }
  }, []);

  const loadEntitiesForType = useCallback(async (entityTypeId: string) => {
    if (!entityTypeId) {
      setState((prev) => ({ ...prev, entitiesForSelectedType: [] }));
      return;
    }
    try {
      const entities = await fetchEntitiesByType(entityTypeId);
      setState((prev) => ({ ...prev, entitiesForSelectedType: entities }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to load entities.",
      }));
    }
  }, []);

  const loadTasks = useCallback(
    async (overrides?: Partial<Pick<UseTasksState, "selectedEntityTypeId" | "selectedEntityId" | "selectedStatus" | "search">>) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const params = {
        entityTypeId: overrides?.selectedEntityTypeId ?? state.selectedEntityTypeId,
        entityId: overrides?.selectedEntityId ?? state.selectedEntityId,
        status: overrides?.selectedStatus ?? state.selectedStatus,
        search: overrides?.search ?? state.search,
      };
      try {
        const tasks = await fetchTasks({
          entityTypeId: params.entityTypeId || undefined,
          entityId: params.entityId || undefined,
          status: params.status || undefined,
          search: params.search || undefined,
        });
        setState((prev) => ({ ...prev, tasks, loading: false }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load tasks.",
        }));
      }
    },
    [state.selectedEntityTypeId, state.selectedEntityId, state.selectedStatus, state.search]
  );

  useEffect(() => {
    loadEntityTypes();
    loadRelationships();
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setEntityTypeFilter = useCallback(
    (entityTypeId: string) => {
      setState((prev) => ({ ...prev, selectedEntityTypeId: entityTypeId, selectedEntityId: "" }));
      loadEntitiesForType(entityTypeId);
      loadTasks({ selectedEntityTypeId: entityTypeId, selectedEntityId: "" });
    },
    [loadEntitiesForType, loadTasks]
  );

  const setEntityFilter = useCallback(
    (entityId: string) => {
      setState((prev) => ({ ...prev, selectedEntityId: entityId }));
      loadTasks({ selectedEntityId: entityId });
    },
    [loadTasks]
  );

  const setStatusFilter = useCallback(
    (status: TaskStatus | "") => {
      setState((prev) => ({ ...prev, selectedStatus: status }));
      loadTasks({ selectedStatus: status });
    },
    [loadTasks]
  );

  const setSearch = useCallback(
    (search: string) => {
      setState((prev) => ({ ...prev, search }));
      loadTasks({ search });
    },
    [loadTasks]
  );

  const addTask = useCallback(
    async (payload: CreateTaskPayload) => {
      await createTask(payload);
      await loadTasks();
    },
    [loadTasks]
  );

  const editTask = useCallback(
    async (taskId: string, payload: Partial<CreateTaskPayload>) => {
      await updateTask({ taskId, ...payload });
      await loadTasks();
    },
    [loadTasks]
  );

  const removeTask = useCallback(
    async (taskId: string) => {
      await deleteTask(taskId);
      await loadTasks();
    },
    [loadTasks]
  );

  // FR6: descendant entity IDs for a given parent, used to roll tasks up
  // through the hierarchy for reporting/grouping without new schema/UI logic.
  const getDescendantEntityIds = useMemo(() => {
    return (parentEntityId: string): string[] => {
      const direct = state.relationships
        .filter((rel) => rel.parentEntityId === parentEntityId)
        .map((rel) => rel.childEntityId);
      const nested = direct.flatMap((childId) => getDescendantEntityIdsInternal(childId, state.relationships));
      return [parentEntityId, ...direct, ...nested];
    };
  }, [state.relationships]);

  return {
    ...state,
    setEntityTypeFilter,
    setEntityFilter,
    setStatusFilter,
    setSearch,
    addTask,
    editTask,
    removeTask,
    refetch: loadTasks,
    loadEntitiesForType,
    getDescendantEntityIds,
  };
}

function getDescendantEntityIdsInternal(
  entityId: string,
  relationships: EntityRelationship[]
): string[] {
  const direct = relationships
    .filter((rel) => rel.parentEntityId === entityId)
    .map((rel) => rel.childEntityId);
  return direct.flatMap((childId) => [childId, ...getDescendantEntityIdsInternal(childId, relationships)]);
}