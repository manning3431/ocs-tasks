import { useEffect, useState } from 'react';
import { PageHeader } from 'shell/PageHeader';
import { DataTable } from 'shell/DataTable';
import { FilterBar } from 'shell/FilterBar';
import { StatusBadge } from 'shell/StatusBadge';
import { Button } from '@pmo/design-system';
import { Card } from '@pmo/design-system';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  assignee: string;
  dueDate: string;
}

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

const columns = [
  { key: 'title', header: 'Title', width: '40%' },
  { key: 'status', header: 'Status', width: '18%', render: (row: Task) => <StatusBadge status={row.status} /> },
  { key: 'assignee', header: 'Assignee', width: '22%' },
  { key: 'dueDate', header: 'Due Date', width: '20%' },
];

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', search: '' });

  useEffect(() => {
    // In production, replace with actual API call
    const mockTasks: Task[] = [
      { id: '1', title: 'Design new dashboard layout', status: 'in_progress', assignee: 'Alice Chen', dueDate: '2026-10-01' },
      { id: '2', title: 'Implement task filtering', status: 'review', assignee: 'Bob Smith', dueDate: '2026-09-28' },
      { id: '3', title: 'Write API documentation', status: 'todo', assignee: 'Carol Lee', dueDate: '2026-10-15' },
      { id: '4', title: 'Fix mobile responsive issues', status: 'done', assignee: 'Dave Wilson', dueDate: '2026-09-20' },
      { id: '5', title: 'Set up CI/CD pipeline', status: 'in_progress', assignee: 'Eve Brown', dueDate: '2026-10-10' },
    ];
    setTasks(mockTasks);
    setLoading(false);
  }, []);

  const filteredTasks = tasks.filter((t) => {
    if (filters.status && t.status !== filters.status) return false;
    if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleCreateTask = () => {
    alert('Create task modal would open here');
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Tasks"
        subtitle="Manage and track your tasks"
        action={
          <Button onClick={handleCreateTask}>Create Task</Button>
        }
      />

      <Card>
        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          fields={[
            { key: 'search', type: 'search', placeholder: 'Search tasks...' },
            { key: 'status', type: 'select', options: statusOptions, placeholder: 'All statuses' },
          ]}
        />
      </Card>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-surface-500">Loading tasks...</div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredTasks}
            keyExtractor={(row) => row.id}
            emptyMessage="No tasks found"
            striped
            hoverable
          />
        )}
      </Card>
    </div>
  );
}