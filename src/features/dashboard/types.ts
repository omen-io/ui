export type DashboardRunStatus =
  "completed" | "completed_with_differences" | "failed"

export const DASHBOARD_STATUSES: DashboardRunStatus[] = [
  "completed",
  "completed_with_differences",
  "failed",
]

export type DashboardSourceSummary = {
  source: string
  runCount: number
  statusCounts: Record<DashboardRunStatus, number>
}

export type DashboardRunFrequency = {
  date: string
  experimentId?: string
  source: string
  status: DashboardRunStatus
  count: number
}

export type DashboardExperimentRisk = {
  experimentId: string
  name: string
  source: string
  totalRuns: number
  statusCounts: Record<DashboardRunStatus, number>
}

export type Dashboard = {
  summary: {
    experimentCount: number
    totalRunCount: number
    notCompletedRunCount: number
  }
  runStatusDistribution: Array<{
    status: DashboardRunStatus
    count: number
  }>
  sourceDistribution: DashboardSourceSummary[]
  runFrequency: DashboardRunFrequency[]
  experimentRisk: DashboardExperimentRisk[]
}

export type DashboardFilterState = {
  statuses: DashboardRunStatus[]
  sources: string[]
  experiments: string[]
}

export type DashboardOrdering = {
  sources: {
    field: "runCount"
    direction: "desc"
  }
  experiments: Array<{
    field: "incompletePercentage" | "incompleteCount" | "name" | "experimentId"
    direction: "asc" | "desc"
  }>
}

export type DashboardRequest = {
  initialize?: boolean
  filters: DashboardFilterState
  ordering: DashboardOrdering
}

export type DashboardExperimentChartRow = DashboardExperimentRisk & {
  incompleteCount: number
  incompletePercentage: number
}

export type DashboardResponse = {
  metadata: {
    availableFilters: {
      statuses: DashboardRunStatus[]
      sources: string[]
      experiments: Array<Pick<DashboardExperimentRisk, "experimentId" | "name">>
    }
    filters: DashboardFilterState
    ordering: DashboardOrdering
    hasSelection: boolean
    summary: Dashboard["summary"]
  }
  data: {
    pieChart: Array<{
      status: DashboardRunStatus
      count: number
    }>
    sourceChart: DashboardSourceSummary[]
    runChart: Array<Record<string, number | string>>
    experimentChart: {
      rows: DashboardExperimentChartRow[]
      emptyState: boolean
    }
  }
}
