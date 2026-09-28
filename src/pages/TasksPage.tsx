import { useEffect, useState } from 'react';
import {
  PageHeader,
  DataTable,
  FilterBar,
  StatusBadge,
  Card,
} from '@pmo/design-system';

export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  assignee: string;
  dueDate: string;
}

type StatusBadgeColor = 'green' | 'amber' | 'red' | 'grey' | 'blue';

const statusConfig: Record<Task['status'], { label: string; color: StatusBadgeColor }> = {
  todo: { label: 'To Do', color: 'grey' },
  in_progress: { label: 'In Progress', color: 'blue' },
  review: { label: 'Review', color: 'amber' },
  done: { label: 'Done', color: 'green' },
};

const filterOptions = ['All', 'To Do', 'In Progress', 'Review', 'Done'];

const optionToStatus: Record<string, Task['status'] | ''> = {
  All: '',
  'To Do': 'todo',
  'In Progress': 'in_progress',
  Review: 'review',
  Done: 'done',
};

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Design new dashboard layout',
        status: 'in_progress',
        assignee: 'Alice Chen',
        dueDate: '2026-10-01',
      },
      {
        id: '2',
        title: 'Implement task filtering',
        status: 'review',
        assignee: 'Bob Smith',
        dueDate: '2026-09-28',
      },
      {
        id: '3',
        title: 'Write API documentation',
        status: 'todo',
        assignee: 'Carol Lee',
        dueDate: '2026-10-15',
      },
      {
        id: '4',
        title: 'Fix mobile responsive issues',
        status: 'done',
        assignee: 'Dave Wilson',
        dueDate: '2026-09-20',
      },
      {
        id: '5',
        title: 'Set up CI/CD pipeline',
        status: 'in_progress',
        assignee: 'Eve Brown',
        dueDate: '2026-10-10',
      },
    ];
    setTasks(mockTasks);
    setLoading(false);
  }, []);

  const handleCreateTask = () => {
    alert('Create task modal would open here');
  };

  const selectedStatusCode = optionToStatus[statusFilter] ?? '';

  const filteredTasks = tasks.filter((task: Task) => {
    if (selectedStatusCode && task.status !== selectedStatusCode) {
      return false;
    }
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.assignee.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const columns = [
    {
      id: 'title',
      header: 'Title',
      render: (row: Task) => (
        <span className="font-medium text-surface-900">{row.title}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      render: (row: Task) => {
        const conf = statusConfig[row.status];
        return <StatusBadge label={conf.label} color={conf.color} />;
      },
    },
    {
      id: 'assignee',
      header: 'Assignee',
      render: (row: Task) => <span>{row.assignee}</span>,
    },
    {
      id: 'dueDate',
      header: 'Due Date',
      render: (row: Task) => (
        <span className="text-surface-500">{row.dueDate}</span>
      ),
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
        onPrimaryAction={handleCreateTask}
      />

      <Card padded>
        <FilterBar
          filters={filterConfigs}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search tasks by title or assignee..."
        />
      </Card>

      <Card padded>
        {loading ? (
          <div className="p-8 text-center text-surface-500">Loading tasks...</div>
        ) : (
          <DataTable
            columns={columns}
            rows={filteredTasks}
            getRowKey={(row: Task) => row.id}
            emptyMessage="No tasks found matching your filters."
          />
        )}
      </Card>
    </div>
  );
}

export default TasksPage;