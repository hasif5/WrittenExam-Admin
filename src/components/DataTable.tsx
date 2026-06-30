// Reusable Mantine React Table wrapper in manual (server-driven) mode.
// Centralizes loading/error/empty states and pagination wiring so list pages
// map table state directly to backend limit/offset (+ optional global search -> ?q/?search).
// Opt-in row selection drives a shared bulk-action bar so any list gets multi-row
// operations by passing enableRowSelection + renderBulkActions (no per-page plumbing).
// Author: Hasif Ahmed (www.hasif.info)

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Button, Collapse, Group, Stack, Text, TextInput } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_RowData,
  type MRT_RowSelectionState,
} from "mantine-react-table";
import { IconFilter, IconSearch } from "@tabler/icons-react";
import { errorMessage } from "@/lib/errors";
import classes from "./DataTable.module.css";

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
  // Primary actions (e.g. a "Create" button); rendered at the toolbar's left.
  toolbar?: ReactNode;
  // Filter controls (selects/segmented controls); rendered right-aligned next to
  // the search box so every list page places its filters consistently.
  filters?: ReactNode;
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
  filters,
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const resolveId = getRowId ?? ((row: T) => String((row as { id?: unknown }).id));
  const clearSelection = useCallback(() => {
    setRowSelection((current) =>
      Object.keys(current).length > 0 ? {} : current,
    );
  }, []);

  // Server-side pagination/filtering returns a fresh page of rows, so a stale
  // selection from another page can no longer be resolved - clear it on change.
  useEffect(() => {
    clearSelection();
  }, [clearSelection, pagination.pageIndex, pagination.pageSize, globalFilter]);

  const selectedRows =
    enableRowSelection && renderBulkActions
      ? data.filter((row) => rowSelection[resolveId(row)])
      : [];

  const hasBulkBar = selectedRows.length > 0 && Boolean(renderBulkActions);
  const showTopToolbar =
    Boolean(toolbar) ||
    Boolean(filters) ||
    enableGlobalFilter ||
    (enableRowSelection && Boolean(renderBulkActions));
  const isMobile = useMediaQuery("(max-width: 48em)");
  const hasQueryControls = Boolean(filters) || enableGlobalFilter;

  useEffect(() => {
    if (!isMobile) {
      setMobileFiltersOpen(false);
    }
  }, [isMobile]);

  const queryControls = (
    <Group
      gap="sm"
      wrap="wrap"
      align="center"
      justify={isMobile ? "flex-start" : "flex-end"}
      style={{ width: "100%" }}
    >
      {filters}
      {enableGlobalFilter ? (
        <TextInput
          aria-label={searchPlaceholder ?? "Search table"}
          placeholder={searchPlaceholder ?? "Search"}
          leftSection={<IconSearch size={16} />}
          value={globalFilter ?? ""}
          onChange={(event) => onGlobalFilterChange?.(event.currentTarget.value)}
          style={{ minWidth: isMobile ? "100%" : 230 }}
        />
      ) : null}
    </Group>
  );

  const table = useMantineReactTable<T>({
    columns,
    data,
    rowCount,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    enableSorting: false,
    enableColumnActions: false,
    // Server-driven lists do not wire per-column filtering, so MRT's column
    // filter text inputs (and the funnel toggle) would be dead UI. Disable them;
    // pages provide friendly toolbar filters + the global search box instead.
    enableColumnFilters: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    // The wrapper renders its own search control so filters/search/actions keep
    // one consistent layout across every table page.
    enableGlobalFilter: false,
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
    mantinePaperProps: { withBorder: true, shadow: "xs" },
    // Shared row micro-interaction (hover tint + leading accent bar) so every list
    // page feels as alive as the dashboard cards. See DataTable.module.css.
    mantineTableBodyRowProps: { className: classes.row },
    // Let long cell content wrap instead of forcing a very wide table - keeps lists
    // readable on mobile (the container still scrolls horizontally when needed).
    mantineTableBodyCellProps: {
      style: { whiteSpace: "normal", wordBreak: "break-word", verticalAlign: "top" },
    },
    // Mobile pagination: drop the space-hungry "rows per page" select and compact
    // controls so the range + prev/next fit on one tidy, centered row (no wrapping).
    mantinePaginationProps: {
      showRowsPerPage: !isMobile,
      withControls: true,
      ...(isMobile ? { size: "sm" as const } : {}),
    },
    mantineBottomToolbarProps: isMobile
      ? { style: { justifyContent: "center" } }
      : undefined,
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
          <Stack gap="sm" style={{ flex: 1, width: "100%" }}>
            {toolbar || hasBulkBar ? (
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
            ) : null}
            {hasQueryControls && isMobile ? (
              <Stack gap="xs">
                <Button
                  variant="light"
                  size="sm"
                  leftSection={<IconFilter size={16} />}
                  onClick={() => setMobileFiltersOpen((open) => !open)}
                  aria-expanded={mobileFiltersOpen}
                >
                  Filters
                </Button>
                <Collapse in={mobileFiltersOpen}>
                  {mobileFiltersOpen ? queryControls : null}
                </Collapse>
              </Stack>
            ) : hasQueryControls ? (
              queryControls
            ) : null}
          </Stack>
        )
      : undefined,
    localization: { noRecordsToDisplay: emptyText },
    initialState: { density: "xs" },
  });

  return <MantineReactTable table={table} />;
}
