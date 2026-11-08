import { usePaginatedTable } from "@/components/ui/paginated-table"
import { listRuns, type RunOrderBy } from "../api"
import type { RunListItem } from "../types"

export const RUN_PAGE_SIZES = [10, 25, 50] as const

const initialState = {
  filter: "",
  orderBy: "startedAt" as RunOrderBy,
  orderDirection: "desc" as const,
  limit: RUN_PAGE_SIZES[0],
  offset: 0,
}

export function useRuns() {
  return usePaginatedTable<RunListItem, RunOrderBy>(initialState, listRuns)
}
