/**
 * tasks-ui/src/types/remotes.d.ts
 * Ambient module declarations for shell's federated components. Prop
 * types are hand-copied from shell's component source (NOT imported --
 * no build-time dependency across repos) and must be kept in sync
 * manually whenever shell's component APIs change.
 */

declare module "shell/DataTable" {
  export interface Column<T> {
    id: string;
    header: string;
    render: (row: T) => React.ReactNode;
    sortable?: boolean;
    sortValue?: (row: T) => string | number;
  }
  export interface DataTableProps<T> {
    columns: Column<T>[];
    rows: T[];
    getRowKey: (row: T) => string;
    emptyMessage?: string;
  }
  export default function DataTable<T>(props: DataTableProps<T>): JSX.Element;
}

declare module "shell/FilterBar" {
  export interface FilterConfig {
    id: string;
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
  }
  export interface FilterBarProps {
    filters: FilterConfig[];
    searchValue: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
  }
  export default function FilterBar(props: FilterBarProps): JSX.Element;
}

declare module "shell/PageHeader" {
  export interface PageHeaderProps {
    icon?: React.ReactNode;
    title: string;
    primaryActionLabel?: string;
    onPrimaryAction?: () => void;
  }
  export default function PageHeader(props: PageHeaderProps): JSX.Element;
}

declare module "shell/StatusBadge" {
  export type StatusBadgeColor = "green" | "amber" | "red" | "grey" | "blue";
  export interface StatusBadgeProps {
    label: string;
    color: StatusBadgeColor;
  }
  export default function StatusBadge(props: StatusBadgeProps): JSX.Element;
}