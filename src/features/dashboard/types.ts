export type DashboardRunStatus =
  "completed" | "completed_with_differences" | "failed"

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
