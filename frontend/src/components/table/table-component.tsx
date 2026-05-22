import {
  type Cell,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { ArrowUpDown } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import RenderComponents from "./table-cells/RenderComponents";
import {
  type BaseRowData,
  cellType,
  type CustomColumn,
  type TableProps,
} from "./types";
import { EmptyStateCard } from "@/components/empty-state/empty-state-card";
import { Pagination } from "./table-cells/pagination";
import { cn } from "@/lib/utils";
import type { TableEmptyState } from "./types";

const LOADING_ROW_KEYS = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
] as const;

const TableComponent = <T extends BaseRowData>({
  data,
  columns,
  onClickRow,
  handleActionClick,
  isLoadingAction,
  getSelectedRows,
  selectionMode = "multiple",
  meta,
  handlePaginate,
  setPageSize,
  pageSize,
  paginate = false,
  loading,
  isFiltered = false,
  listActions,
  emptyState,
}: TableProps<T>) => {
  const {
    page: currentPage = 1,
    // hasNext = false,
    total: totalRecords = 0,
    limit: perPage = 0,
    hasNext = false,
  } = meta ?? {};

  const [selectedRows, setSelectedRows] = React.useState<Set<T>>(new Set());
  const [sorting, setSorting] = React.useState<{ id: string; desc: boolean }[]>(
    [],
  ); // Add sorting state

  const handleSelectRow = React.useCallback(
    (rowData: T) => {
      let updatedSelectedRows: Set<T>;
      if (selectionMode === "single") {
        if (selectedRows.has(rowData) && selectedRows.size === 1) {
          updatedSelectedRows = new Set();
        } else {
          updatedSelectedRows = new Set([rowData]);
        }
      } else {
        updatedSelectedRows = new Set(selectedRows);
        if (updatedSelectedRows.has(rowData)) {
          updatedSelectedRows.delete(rowData);
        } else {
          updatedSelectedRows.add(rowData);
        }
      }
      setSelectedRows(updatedSelectedRows);
      if (getSelectedRows) getSelectedRows(Array.from(updatedSelectedRows));
    },
    [getSelectedRows, selectedRows, selectionMode],
  );

  const tableColumns = React.useMemo(() => {
    if (getSelectedRows) {
      return [
        {
          id: "selection",
          header: () =>
            selectionMode === "single" ? (
              <Checkbox checked={false} disabled />
            ) : (
              <Checkbox
                onCheckedChange={(e) => {
                  const allRows = data.map((item) => item);
                  const setRows = e ? new Set(allRows) : new Set<T>();
                  setSelectedRows(setRows);
                  if (getSelectedRows) getSelectedRows(Array.from(setRows));
                }}
                checked={
                  selectedRows.size === data.length && selectedRows.size > 0
                }
                disabled={data.length === 0}
              />
            ),
          type: cellType.SELECTIONS,
        } as unknown as ColumnDef<T>,
        ...columns.map((column) => {
          return {
            ...column,
            id:
              column.id ||
              (column as unknown as { accessor: keyof T }).accessor,
          };
        }),
      ] as ColumnDef<T>[];
    }

    return [
      ...columns.map((column) => ({
        ...column,
        id: column.id || (column as unknown as { accessor: keyof T }).accessor,
        accessorFn: (row: T) =>
          row[(column as unknown as { accessor: keyof T }).accessor],
      })),
    ] as ColumnDef<T>[];
  }, [columns, data, getSelectedRows, selectedRows, selectionMode]);

  const renderEmptyState = React.useCallback((state: TableEmptyState) => {
    if (React.isValidElement(state)) return state;
    if (typeof state === "object" && state !== null && "title" in state) {
      return (
        <EmptyStateCard
          title={state.title}
          description={state.description}
          buttonName={state.buttonName}
          buttonIcon={state.buttonIcon}
          onButtonClick={state.onButtonClick}
          className={cn("min-h-[360px]", state.className)}
        />
      );
    }
    return null;
  }, []);

  const { getHeaderGroups, getRowModel } = useReactTable({
    data,
    state: { columnVisibility: { none: false }, sorting },
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    enableSorting: true,
    getSortedRowModel: getSortedRowModel(),
  });

  const displayCell = React.useCallback(
    (cell: Cell<T, unknown>, index: number) => {
      const column = cell.column.columnDef as CustomColumn<T>;

      return (
        <RenderComponents<T>
          selectedRows={selectedRows}
          handleSelectRow={handleSelectRow}
          handleActionClick={handleActionClick}
          column={column}
          row={cell.row.original}
          value={cell.row.original[column.accessor]}
          index={index}
          isLoading={isLoadingAction}
          listActions={listActions}
        />
      );
    },
    [
      handleActionClick,
      handleSelectRow,
      isLoadingAction,
      listActions,
      selectedRows,
    ],
  );

  return (
    <div className="w-full">
      <div className="overflow-x-auto overflow-y-visible border-0 border-b border-border bg-background">
        <Table>
          <TableHeader className="bg-muted/40 sticky top-0 z-10 [&_tr]:border-b [&_tr]:border-border">
            {getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-border hover:bg-muted/40">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className="text-accent-foreground h-10 px-4 font-normal whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className="[&_tr]:border-b [&_tr]:border-border [&_tr]:border-l-0 [&_tr]:border-r-0">
            {loading &&
              LOADING_ROW_KEYS.slice(
                0,
                isFiltered ? Number(perPage) || 10 : 10,
              ).map((rowKey) => (
                <TableRow
                  className="relative z-0 h-12 border-border bg-background data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
                  key={`loading-row-${rowKey}`}>
                  {columns?.map((column, colIndex) => (
                    <TableCell
                      key={column.id ?? String(column.accessor ?? colIndex)}
                      className="border-0 px-4">
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading && getRowModel().rows.length === 0 && emptyState ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={getHeaderGroups()[0]?.headers.length ?? columns.length}
                  className="border-0 p-0"
                >
                  {renderEmptyState(emptyState)}
                </TableCell>
              </TableRow>
            ) : null}

            {!loading &&
              getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="relative whitespace-nowrap z-0 h-14 border-border bg-background hover:bg-muted/40 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80">
                  {row.getVisibleCells().map((cell) => {
                    const customColumn = cell.column
                      .columnDef as CustomColumn<T>;

                    return (
                      <TableCell
                        onClick={
                          onClickRow &&
                          !cell.row.original?.disableRow &&
                          ![cellType.ACTIONS, cellType.SELECTIONS].includes(
                            customColumn.type,
                          )
                            ? () => onClickRow(cell.row.original)
                            : undefined
                        }
                        key={cell.id}
                        className={cn(
                          "border-0 px-4",
                          onClickRow ? "cursor-pointer" : "",
                        )}>
                        {displayCell(cell, index)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {paginate && !!totalRecords && (
        <div className="flex items-center justify-between">
          <div className="flex w-full">
            <Pagination
              handlePaginate={handlePaginate}
              hasNextPage={!!hasNext}
              hasPreviousPage={currentPage > 1}
              currentPage={currentPage}
              perPage={perPage}
              total={totalRecords}
              setPageSize={setPageSize}
              pageSize={pageSize}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TableComponent;
