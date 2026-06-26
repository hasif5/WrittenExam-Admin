// Bridges MRT pagination state (pageIndex/pageSize) to backend limit/offset.
// Author: Hasif Ahmed (www.hasif.info)

import { useMemo, useState } from "react";
import type { MRT_PaginationState } from "mantine-react-table";
import { DEFAULT_PAGE_SIZE } from "./constants";

export function usePagination(initialSize = DEFAULT_PAGE_SIZE) {
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: initialSize,
  });

  const { limit, offset } = useMemo(
    () => ({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
    }),
    [pagination],
  );

  return { pagination, setPagination, limit, offset };
}
