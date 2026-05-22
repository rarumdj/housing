import type { ReactNode } from "react";
import type { Row } from "@tanstack/react-table";

export type IMeta = Partial<{
  total: number;
  page: number;
  previous: number | null;
  next: number | null;
  hasNext: boolean | null;
  limit: number;
}>;

export interface ListActions {
  name: string;
  action: string;
  isDelete?: boolean;
}
export type TableEmptyState =
  | React.ReactNode
  | {
      title: string;
      description: string;
      buttonName?: string;
      buttonIcon?: ReactNode;
      onButtonClick?: () => void;
      className?: string;
    };

export interface TableProps<T> {
  data: T[];
  columns: CustomColumn<T>[];
  emptyState?: TableEmptyState;
  updateOrderStatus?: (
    orderSlug: string,
    status: "PREPARING" | "READY_FOR_PICKUP" | "ACCEPTED" | "CANCELED",
  ) => Promise<void>;
  onClickRow?: (x: T) => void;
  handleActionClick?: (action?: string, row?: T) => void;
  isLoadingAction?: boolean;
  getSelectedRows?: (x: T[]) => void;
  /** When set with `getSelectedRows`, `'single'` enforces one row at a time and disables the header “select all” checkbox. */
  selectionMode?: "single" | "multiple";
  meta?: IMeta;
  handlePaginate?: (page: number) => void;
  setPageSize?: React.Dispatch<React.SetStateAction<number>>;
  pageSize?: number;
  paginate?: boolean;
  loading?: boolean;
  isFiltered?: boolean;
  listActions?: ListActions[];
}

export interface RowProps<T> {
  row: Row<T>;
  activeRow?: number;
  updateOrderStatus?: (
    orderSlug: string,
    status: "PREPARING" | "READY_FOR_PICKUP" | "ACCEPTED" | "CANCELED",
  ) => Promise<void>;
  onClickRow?: (x: T) => void;
  handleActionClick?: (action?: string, row?: T) => void;
}

export const cellType = {
  CHECKBOX: "checkbox",
  STRING: "string",
  MODIFY: "modify",
  BADGE: "badge",
  SELECTIONS: "selections",
  EXPANDER: "expander",
  AVATAR: "avatar",
  FILE: "file",
  ACTIONS: "actions",
  DATE: "date",
  COUNTRY: "country",
};

export type CellType = Lowercase<keyof typeof cellType>;

export type ActionType = "edit" | "delete" | "toggle" | "kebab";

export type CustomColumn<T> = {
  id?: string;
  header: ReactNode;
  accessor: keyof T;
  type: CellType;
  actions?: ActionType[];
};

export interface BaseRowData {
  disableRow?: boolean;
  action?: unknown;
  row?: unknown;
  [key: string]: unknown;
}

export interface RenderComponentsProps<T> {
  handleActionClick?: (action?: string, row?: T) => void;
  column: CustomColumn<T>;
  row: T;
  value: unknown;
  index: number;
  isLoading?: boolean;
  selectedRows: Set<T>;
  handleSelectRow: (x: T) => void;
  listActions?: ListActions[];
}

export interface ModifyProps<T> {
  handleActionClick?: (action?: string, row?: T) => void;
  index: number;
  item: T & BaseRowData;
  actions?: ActionType[];
  isLoading?: boolean;
  listActions?: ListActions[];
}

export interface SelectionProps<T> extends Pick<
  RenderComponentsProps<T>,
  "selectedRows" | "handleSelectRow"
> {
  index: number;
  item: T & BaseRowData;
}

export type PaginateProps = {
  total: number;
  perPage: number;
  currentPage: number;
  totalPages?: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage?: number;
} & Pick<
  TableProps<BaseRowData>,
  "handlePaginate" | "setPageSize" | "pageSize"
>;

export interface TimeLeftProps {
  start: Date;
  end: Date;
}
