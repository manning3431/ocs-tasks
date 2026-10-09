// src/pages/TasksPage.tsx

import { useEffect, useState, useCallback } from 'react';
import {
  PageHeader,
  DataTable,
  FilterBar,
  StatusBadge,
  Card,
} from '@pmo/design-system';
import type { StatusBadgeColor } from '@pmo/design-system';
import type { TaskOut } from '../types/task';
import { taskService } from '../services/taskService';
import { CreateTaskModal } from '../components/CreateTaskModal';

const statusBadgeMap: Record<string, { label: string; color: StatusBadgeColor }> = {
  todo: { label: 'To Do', color: 'grey' },
  active: { label: 'In Progress', color: 'blue' },
  in_progress: { label: 'In Progress', color: 'blue' },
  review: { label: 'Review', color: 'amber' },
  done: { label: 'Done', color: 'green' },
  closed: { label: 'Done', color: 'green' },
};

const filterOptions = ['All', 'To Do', 'In Progress', 'Review', 'Done'];

const optionToStatusCode: Record<string, string> = {
  All: '',
  'To Do': 'todo',
  'In Progress': 'active',
  Review: 'review',
  Done: 'done',
};

export function TasksPage() {
  const [tasks, setTasks] = useState<TaskOut[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<TaskOut | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const tasksRes = await taskService.getTasks();
      if (tasksRes.success) {
        setTasks(tasksRes.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load task records.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleTaskCreated = (newTask: TaskOut) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleTaskUpdated = (updatedTask: TaskOut) => {
    setTasks((prev) =>
      prev.map((t) => (t.task_id === updatedTask.task_id ? updatedTask : t)),
    );
  };

  const openCreateModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: TaskOut) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const selectedStatusCode = optionToStatusCode[statusFilter] ?? '';

  const filteredTasks = tasks.filter((task: TaskOut) => {
    if (selectedStatusCode) {
      const normalizedCode = task.status_code.toLowerCase();
      if (selectedStatusCode === 'active' && (normalizedCode === 'active' || normalizedCode === 'in_progress')) {
        // match
      } else if (normalizedCode !== selectedStatusCode) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(term);
      const matchEntity = (task.entity_name ?? '').toLowerCase().includes(term);
      const matchDisplayId = task.display_id.toLowerCase().includes(term);
      if (!matchTitle && !matchEntity && !matchDisplayId) {
        return false;
      }
    }

    return true;
  });

  const columns = [
    {
      id: 'displayId',
      header: 'ID',
      render: (row: TaskOut) => (
        <span className="font-mono text-xs text-surface-500 font-semibold">{row.display_id}</span>
      ),
      sortable: true,
      sortValue: (row: TaskOut) => row.display_id,
    },
    {
      id: 'title',
      header: 'Title',
      render: (row: TaskOut) => (
        <div className="flex flex-col">
          <span className="font-medium text-surface-900">{row.title}</span>
          {row.description && (
            <span className="text-xs text-surface-500 line-clamp-1">{row.description}</span>
          )}
        </div>
      ),
      sortable: true,
      sortValue: (row: TaskOut) => row.title,
    },
    {
      id: 'entity',
      header: 'Entity / Project',
      render: (row: TaskOut) => (
        <span className="text-surface-700 text-sm">{row.entity_name}</span>
      ),
      sortable: true,
      sortValue: (row: TaskOut) => row.entity_name ?? '',
    },
    {
      id: 'status',
      header: 'Status',
      render: (row: TaskOut) => {
        const config = statusBadgeMap[row.status_code.toLowerCase()] ?? {
          label: row.status_label || row.status_code,
          color: 'grey' as StatusBadgeColor,
        };
        return <StatusBadge label={config.label} color={config.color} />;
      },
      sortable: true,
      sortValue: (row: TaskOut) => row.status_label,
    },
    {
      id: 'dueDate',
      header: 'Due Date',
      render: (row: TaskOut) => (
        <span className="text-surface-500">{row.due_date || '—'}</span>
      ),
      sortable: true,
      sortValue: (row: TaskOut) => row.due_date ?? '',
    },
  ];

  const filterConfigs = [
    {
      id: 'status-filter',
      label: 'Status',
      options: filterOptions,
      value: statusFilter,
      onChange: (selectedOption: string) => setStatusFilter(selectedOption),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Tasks"
        primaryActionLabel="Create Task"
        onPrimaryAction={openCreateModal}
      />

      <Card padded>
        <FilterBar
          filters={filterConfigs}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search tasks by title, ID, or project..."
        />
      </Card>

      {errorMessage && (
        <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={loadTasks}
            className="text-xs font-semibold underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      <Card padded>
        {loading ? (
          <div className="p-8 text-center text-surface-500">Loading tasks from database...</div>
        ) : (
          <DataTable
            columns={columns}
            rows={filteredTasks}
            getRowKey={(row: TaskOut) => row.task_id}
            onRowClick={openEditModal}
            emptyMessage="No tasks found matching your filters."
          />
        )}
      </Card>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onTaskCreated={handleTaskCreated}
        task={selectedTask}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  );
}

export default TasksPage;