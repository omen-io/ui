import { useEffect, useMemo } from "react"
import { usePaginatedTable } from "@/components/ui/paginated-table"
import {
  parsePaginatedTableSearchParams,
  serializePaginatedTableSearchParams,
} from "@/hooks/use-paginated-table-search-params"
import { useSearchParams } from "react-router"
import {
  listExperiments,
  type ExperimentOrderBy,
  type OrderDirection,
} from "../api"
import type { ExperimentListItem } from "../types"

export const EXPERIMENT_PAGE_SIZES = [10, 25, 50] as const

export type ExperimentListState = {
  filter: string
  orderBy: ExperimentOrderBy
  orderDirection: OrderDirection
  limit: number
  offset: number
}

const initialState: ExperimentListState = {
  filter: "",
  orderBy: "date",
  orderDirection: "desc",
  limit: EXPERIMENT_PAGE_SIZES[0],
  offset: 0,
}

export function useExperiments() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = useMemo(
    () =>
      parsePaginatedTableSearchParams(searchParams, {
        defaults: initialState,
        orderByValues: ["date", "name", "runCount"],
        pageSizes: EXPERIMENT_PAGE_SIZES,
      }),
    [searchParams],
  )
  const table = usePaginatedTable<ExperimentListItem, ExperimentOrderBy>(
    initialQuery,
    listExperiments,
  )

  useEffect(() => {
    setSearchParams(
      serializePaginatedTableSearchParams(table.query, {
        defaults: initialState,
        orderByValues: ["date", "name", "runCount"],
        pageSizes: EXPERIMENT_PAGE_SIZES,
      }),
      { replace: true },
    )
  }, [setSearchParams, table.query])

  return table
}
