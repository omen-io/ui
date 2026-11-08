import type {
  Dashboard,
  DashboardExperimentChartRow,
  DashboardOrdering,
  DashboardRequest,
  DashboardResponse,
  DashboardRunStatus,
} from "@/features/dashboard/types"

export const STATUSES: DashboardRunStatus[] = [
  "completed",
  "completed_with_differences",
  "failed",
]

const DEFAULT_ORDERING: DashboardOrdering = {
  sources: { field: "runCount", direction: "desc" },
  experiments: [
    { field: "incompletePercentage", direction: "desc" },
    { field: "incompleteCount", direction: "desc" },
    { field: "name", direction: "asc" },
    { field: "experimentId", direction: "asc" },
  ],
}

function getIncompleteRuns(
  statusCounts: Record<DashboardRunStatus, number>,
  selectedStatuses: Set<DashboardRunStatus>
) {
  return [...selectedStatuses]
    .filter((status) => status !== "completed")
    .reduce((total, status) => total + statusCounts[status], 0)
}

function getStatusDistribution(
  experiments: Dashboard["experimentRisk"],
  selectedSources: Set<string>,
  selectedExperiments: Set<string>
) {
  return STATUSES.map((status) => ({
    status,
    count: experiments
      .filter(
        (experiment) =>
          selectedSources.has(experiment.source) &&
          selectedExperiments.has(experiment.experimentId)
      )
      .reduce(
        (total, experiment) => total + experiment.statusCounts[status],
        0
      ),
  }))
}

function getSourceDistribution(
  sources: Dashboard["sourceDistribution"],
  experiments: Dashboard["experimentRisk"],
  selectedStatuses: Set<DashboardRunStatus>,
  selectedExperiments: Set<string>
) {
  const distribution = new Map(
    sources.map((source) => [
      source.source,
      {
        source: source.source,
        runCount: 0,
        statusCounts: {
          completed: 0,
          completed_with_differences: 0,
          failed: 0,
        },
      },
    ])
  )

  for (const experiment of experiments) {
    if (!selectedExperiments.has(experiment.experimentId)) continue
    const current = distribution.get(experiment.source)
    if (!current) continue

    for (const status of STATUSES) {
      if (selectedStatuses.has(status)) {
        current.statusCounts[status] += experiment.statusCounts[status]
        current.runCount += experiment.statusCounts[status]
      }
    }
  }

  return [...distribution.values()]
}

function getFrequencyData(
  frequency: Dashboard["runFrequency"],
  selectedSources: Set<string>,
  selectedStatuses: Set<DashboardRunStatus>,
  selectedExperiments: Set<string>,
  experiments: Dashboard["experimentRisk"]
) {
  const experimentsBySource = new Map<string, Set<string>>()
  for (const experiment of experiments) {
    const sourceExperiments =
      experimentsBySource.get(experiment.source) ?? new Set<string>()
    sourceExperiments.add(experiment.experimentId)
    experimentsBySource.set(experiment.source, sourceExperiments)
  }

  const dates = [...new Set(frequency.map((item) => item.date))].sort()
  return dates.map((date) => {
    const row: Record<string, number | string> = { date }
    for (const source of selectedSources) {
      row[source] = frequency
        .filter(
          (item) =>
            item.date === date &&
            item.source === source &&
            selectedStatuses.has(item.status) &&
            (item.experimentId
              ? selectedExperiments.has(item.experimentId)
              : [...(experimentsBySource.get(item.source) ?? [])].every(
                  (experimentId) => selectedExperiments.has(experimentId)
                ))
        )
        .reduce((total, item) => total + item.count, 0)
    }
    return row
  })
}

function compareExperimentRows(
  a: DashboardExperimentChartRow,
  b: DashboardExperimentChartRow
) {
  return (
    b.incompletePercentage - a.incompletePercentage ||
    b.incompleteCount - a.incompleteCount ||
    a.name.localeCompare(b.name) ||
    a.experimentId.localeCompare(b.experimentId)
  )
}

export function defaultDashboardRequest(
  dashboard: Dashboard
): DashboardRequest {
  return {
    filters: {
      statuses: [...STATUSES],
      sources: dashboard.sourceDistribution.map((item) => item.source),
      experiments: dashboard.experimentRisk.map((item) => item.experimentId),
    },
    ordering: DEFAULT_ORDERING,
  }
}

export function projectDashboard(
  dashboard: Dashboard,
  request: DashboardRequest
): DashboardResponse {
  const selectedStatuses = new Set(request.filters.statuses)
  const selectedSources = new Set(request.filters.sources)
  const selectedExperiments = new Set(request.filters.experiments)
  const sourceChart = getSourceDistribution(
    dashboard.sourceDistribution,
    dashboard.experimentRisk,
    selectedStatuses,
    selectedExperiments
  ).sort((a, b) => b.runCount - a.runCount)
  const experimentRows = dashboard.experimentRisk
    .filter((experiment) => selectedSources.has(experiment.source))
    .map((experiment) => {
      const incompleteCount = getIncompleteRuns(
        experiment.statusCounts,
        selectedStatuses
      )
      return {
        ...experiment,
        incompleteCount,
        incompletePercentage:
          experiment.totalRuns === 0
            ? 0
            : incompleteCount / experiment.totalRuns,
      }
    })
    .sort(compareExperimentRows)
  const hasSelection =
    selectedStatuses.size > 0 &&
    selectedSources.size > 0 &&
    selectedExperiments.size > 0

  return {
    metadata: {
      availableFilters: {
        statuses: [...STATUSES],
        sources: dashboard.sourceDistribution.map((item) => item.source),
        experiments: dashboard.experimentRisk.map(({ experimentId, name }) => ({
          experimentId,
          name,
        })),
      },
      filters: {
        statuses: [...selectedStatuses],
        sources: [...selectedSources],
        experiments: [...selectedExperiments],
      },
      ordering: request.ordering,
      hasSelection,
      summary: dashboard.summary,
    },
    data: {
      pieChart: getStatusDistribution(
        dashboard.experimentRisk,
        selectedSources,
        selectedExperiments
      ),
      sourceChart,
      runChart: getFrequencyData(
        dashboard.runFrequency,
        selectedSources,
        selectedStatuses,
        selectedExperiments,
        dashboard.experimentRisk
      ),
      experimentChart: {
        rows: experimentRows,
        emptyState: dashboard.experimentRisk.every(
          (experiment) =>
            !selectedSources.has(experiment.source) ||
            !selectedExperiments.has(experiment.experimentId) ||
            getIncompleteRuns(experiment.statusCounts, selectedStatuses) === 0
        ),
      },
    },
  }
}
