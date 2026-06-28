// Reusable Mantine React Table wrapper in manual (server-driven) mode.
// Centralizes loading/error/empty states and pagination wiring so list pages
// map table state directly to backend limit/offset (+ optional global search -> ?q/?search).
// Opt-in row selection drives a shared bulk-action bar so any list gets multi-row
// operations by passing enableRowSelection + renderBulkActions (no per-page plumbing).
// Author: Hasif Ahmed (www.hasif.info)

import { useEffect, useState, type ReactNode } from "react";
import { Button, Group, Text } from "@mantine/core";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_RowData,
  type MRT_RowSelectionState,
} from "mantine-react-table";
import { errorMessage } from "@/lib/errors";

interface DataTableProps<T extends MRT_RowData> {
  columns: MRT_ColumnDef<T>[];
  data: T[];
  rowCount: number;
  pagination: MRT_PaginationState;
  onPaginationChange: (updater: React.SetStateAction<MRT_PaginationState>) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  error?: unknown;
  enableGlobalFilter?: boolean;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  searchPlaceholder?: string;
  toolbar?: ReactNode;
  emptyText?: string;
  enableRowActions?: boolean;
  renderRowActions?: (props: { row: { original: T } }) => ReactNode;
  enableExpanding?: boolean;
  enableExpandAll?: boolean;
  getSubRows?: (originalRow: T, index: number) => T[] | undefined;
  renderDetailPanel?: (props: { row: { original: T } }) => ReactNode;
  // Row selection + bulk actions. Provide getRowId so selection survives re-renders
  // and resolves back to the original rows handed to renderBulkActions.
  enableRowSelection?: boolean;
  getRowId?: (row: T) => string;
  renderBulkActions?: (selected: T[], clearSelection: () => void) => ReactNode;
}

export function DataTable<T extends MRT_RowData>({
  columns,
  data,
  rowCount,
  pagination,
  onPaginationChange,
  isLoading,
  isFetching,
  isError,
  error,
  enableGlobalFilter = false,
  globalFilter,
  onGlobalFilterChange,
  searchPlaceholder,
  toolbar,
  emptyText = "No records found.",
  enableRowActions = false,
  renderRowActions,
  enableExpanding = false,
  enableExpandAll = false,
  getSubRows,
  renderDetailPanel,
  enableRowSelection = false,
  getRowId,
  renderBulkActions,
}: DataTableProps<T>) {
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const resolveId = getRowId ?? ((row: T) => String((row as { id?: unknown }).id));
  const clearSelection = () => setRowSelection({});

  // Server-side pagination/filtering returns a fresh page of rows, so a stale
  // selection from another page can no longer be resolved - clear it on change.
  useEffect(() => {
    clearSelection();
  }, [pagination.pageIndex, pagination.pageSize, globalFilter]);

  const selectedRows =
    enableRowSelection && renderBulkActions
      ? data.filter((row) => rowSelection[resolveId(row)])
      : [];

  const hasBulkBar = selectedRows.length > 0 && Boolean(renderBulkActions);
  const showTopToolbar = Boolean(toolbar) || (enableRowSelection && Boolean(renderBulkActions));

  const table = useMantineReactTable<T>({
    columns,
    data,
    rowCount,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    enableSorting: false,
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    enableGlobalFilter,
    onPaginationChange,
    onGlobalFilterChange: onGlobalFilterChange
      ? (updater) => {
          const next =
            typeof updater === "function" ? updater(globalFilter ?? "") : (updater ?? "");
          onGlobalFilterChange((next as string) ?? "");
        }
      : undefined,
    enableRowSelection,
    getRowId: enableRowSelection ? (row) => resolveId(row) : undefined,
    onRowSelectionChange: enableRowSelection ? setRowSelection : undefined,
    // Suppress MRT's built-in selection banner so it does not hide our search box
    // and custom bulk bar; we render our own selection summary instead.
    positionToolbarAlertBanner: enableRowSelection ? "none" : undefined,
    state: {
      pagination,
      isLoading: Boolean(isLoading),
      showProgressBars: Boolean(isFetching),
      showAlertBanner: Boolean(isError),
      ...(enableRowSelection ? { rowSelection } : {}),
      ...(enableGlobalFilter ? { globalFilter: globalFilter ?? "" } : {}),
    },
    mantineToolbarAlertBannerProps: isError
      ? { color: "red", children: errorMessage(error) }
      : undefined,
    mantineSearchTextInputProps: searchPlaceholder
      ? { placeholder: searchPlaceholder, style: { minWidth: 280 } }
      : undefined,
    mantinePaperProps: { withBorder: true, shadow: "xs" },
    enableRowActions,
    renderRowActions: renderRowActions
      ? ({ row }) => renderRowActions({ row: { original: row.original } })
      : undefined,
    enableExpanding,
    enableExpandAll,
    getSubRows,
    renderDetailPanel: renderDetailPanel
      ? ({ row }) => renderDetailPanel({ row: { original: row.original } })
      : undefined,
    positionActionsColumn: "last",
    renderTopToolbarCustomActions: showTopToolbar
      ? () => (
          <Group gap="sm" wrap="wrap" align="center">
            {toolbar}
            {hasBulkBar ? (
              <Group gap="xs" wrap="nowrap" align="center">
                <Text size="sm" fw={500}>
                  {selectedRows.length} selected
                </Text>
                {renderBulkActions?.(selectedRows, clearSelection)}
                <Button variant="subtle" size="xs" onClick={clearSelection}>
                  Clear
                </Button>
              </Group>
            ) : null}
          </Group>
        )
      : undefined,
    localization: { noRecordsToDisplay: emptyText },
    initialState: { density: "xs" },
  });

  return <MantineReactTable table={table} />;
}
