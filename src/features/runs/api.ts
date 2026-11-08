import { request } from "@/lib/http-client"
import type { RunListResponse } from "./types"

export type RunOrderBy = "startedAt" | "endedAt" | "experimentName"
export type OrderDirection = "asc" | "desc"

export type ListRunsOptions = {
  filter?: string
  orderBy?: RunOrderBy
  orderDirection?: OrderDirection
  limit?: number
  offset?: number
  signal?: AbortSignal
}

export const listRuns = ({
  filter = "",
  orderBy = "startedAt",
  orderDirection = "desc",
  limit = 10,
  offset = 0,
  signal,
}: ListRunsOptions = {}) => {
  const params = new URLSearchParams({
    filter,
    orderBy,
    orderDirection,
    limit: String(limit),
    offset: String(offset),
  })
  return request<RunListResponse>(`/api/v1/runs?${params.toString()}`, {
    signal,
  })
}
