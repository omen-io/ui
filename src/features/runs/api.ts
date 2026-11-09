import { request } from "@/lib/http-client"
import type {
  RunDetailState,
  RunExperiment,
  RunListResponse,
  RunMeasurement,
  RunVariant,
} from "./types"

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

export const getRun = (runId: string, signal?: AbortSignal) =>
  request<RunDetailState["run"]>(`/api/v1/runs/${encodeURIComponent(runId)}`, {
    signal,
  })

export const getRunExperiment = (experimentId: string, signal?: AbortSignal) =>
  request<RunExperiment>(
    `/api/v1/experiments/${encodeURIComponent(experimentId)}`,
    { signal },
  )

export const listRunMeasurements = (runId: string, signal?: AbortSignal) =>
  request<{ items: RunMeasurement[] }>(
    `/api/v1/runs/${encodeURIComponent(runId)}/measurements`,
    { signal },
  )

export const listRunVariants = (experimentId: string, signal?: AbortSignal) =>
  request<{ items: RunVariant[] }>(
    `/api/v1/experiments/${encodeURIComponent(experimentId)}/variants`,
    { signal },
  )
