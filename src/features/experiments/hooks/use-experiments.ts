import { usePaginatedTable } from "@/components/ui/paginated-table"
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
  return usePaginatedTable<ExperimentListItem, ExperimentOrderBy>(
    initialState,
    listExperiments,
  )
}
