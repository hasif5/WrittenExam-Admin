// Tests that MRT pagination state maps to backend limit/offset (manual mode).
// Author: Hasif Ahmed (www.hasif.info)

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePagination } from "./usePagination";

describe("usePagination", () => {
  it("derives limit/offset from pageIndex/pageSize", () => {
    const { result } = renderHook(() => usePagination(25));
    expect(result.current.limit).toBe(25);
    expect(result.current.offset).toBe(0);

    act(() => {
      result.current.setPagination({ pageIndex: 2, pageSize: 25 });
    });
    expect(result.current.limit).toBe(25);
    expect(result.current.offset).toBe(50);
  });
});
