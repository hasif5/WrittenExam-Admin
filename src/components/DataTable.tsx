// Reusable Mantine React Table wrapper in manual (server-driven) mode.
// Centralizes loading/error/empty states and pagination wiring so list pages
// map table state directly to backend limit/offset (+ optional global search -> ?q/?search).
// Author: Hasif Ahmed (www.hasif.info)

import type { ReactNode } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_RowData,
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
}: DataTableProps<T>) {
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
    state: {
      pagination,
      isLoading: Boolean(isLoading),
      showProgressBars: Boolean(isFetching),
      showAlertBanner: Boolean(isError),
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
    renderTopToolbarCustomActions: toolbar ? () => <>{toolbar}</> : undefined,
    localization: { noRecordsToDisplay: emptyText },
    initialState: { density: "xs" },
  });

  return <MantineReactTable table={table} />;
}
