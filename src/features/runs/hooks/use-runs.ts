import { useEffect, useMemo } from "react"
import { usePaginatedTable } from "@/components/ui/paginated-table"
import {
  parsePaginatedTableSearchParams,
  serializePaginatedTableSearchParams,
} from "@/hooks/use-paginated-table-search-params"
import { useSearchParams } from "react-router"
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
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = useMemo(
    () =>
      parsePaginatedTableSearchParams(searchParams, {
        defaults: initialState,
        orderByValues: ["startedAt", "endedAt", "experimentName"],
        pageSizes: RUN_PAGE_SIZES,
      }),
    [searchParams],
  )
  const table = usePaginatedTable<RunListItem, RunOrderBy>(
    initialQuery,
    listRuns,
  )

  useEffect(() => {
    setSearchParams(
      serializePaginatedTableSearchParams(table.query, {
        defaults: initialState,
        orderByValues: ["startedAt", "endedAt", "experimentName"],
        pageSizes: RUN_PAGE_SIZES,
      }),
      { replace: true },
    )
  }, [setSearchParams, table.query])

  return table
}
