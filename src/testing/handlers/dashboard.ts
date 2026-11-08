import { http, HttpResponse } from "msw"

import { projectDashboard, STATUSES } from "./dashboard-projection"
import type {
  Dashboard,
  DashboardOrdering,
  DashboardRequest,
  DashboardRunStatus,
} from "@/features/dashboard/types"
import dashboard from "@/testing/fixtures/dashboard/dashboard.json"

const isStatus = (value: unknown): value is DashboardRunStatus =>
  typeof value === "string" && STATUSES.includes(value as DashboardRunStatus)

function isOrdering(value: unknown): value is DashboardOrdering {
  if (!value || typeof value !== "object") return false
  const ordering = value as Record<string, unknown>
  const sources = ordering.sources
  const experiments = ordering.experiments
  return (
    !!sources &&
    typeof sources === "object" &&
    (sources as Record<string, unknown>).field === "runCount" &&
    (sources as Record<string, unknown>).direction === "desc" &&
    Array.isArray(experiments) &&
    experiments.every(
      (item) =>
        !!item &&
        typeof item === "object" &&
        [
          "incompletePercentage",
          "incompleteCount",
          "name",
          "experimentId",
        ].includes((item as Record<string, unknown>).field as string) &&
        ["asc", "desc"].includes(
          (item as Record<string, unknown>).direction as string
        )
    )
  )
}

function isDashboardRequest(
  value: unknown,
  fixture: Dashboard
): value is DashboardRequest {
  if (!value || typeof value !== "object") return false
  const request = value as Record<string, unknown>
  const filters = request.filters
  const filterValues =
    filters && typeof filters === "object"
      ? (filters as Record<string, unknown>)
      : null
  return (
    !!filterValues &&
    Array.isArray(filterValues.statuses) &&
    (filterValues.statuses as unknown[]).every(isStatus) &&
    Array.isArray(filterValues.sources) &&
    (filterValues.sources as unknown[]).every(
      (source: unknown) =>
        typeof source === "string" &&
        fixture.sourceDistribution.some((item) => item.source === source)
    ) &&
    Array.isArray(filterValues.experiments) &&
    (filterValues.experiments as unknown[]).every(
      (experimentId: unknown) =>
        typeof experimentId === "string" &&
        fixture.experimentRisk.some(
          (experiment) => experiment.experimentId === experimentId
        )
    ) &&
    isOrdering(request.ordering)
  )
}

export const dashboardHandlers = [
  http.post("*/api/v1/dashboard", async ({ request }) => {
    const body = await request.json().catch(() => null)
    if (!isDashboardRequest(body, dashboard as Dashboard)) {
      return HttpResponse.json(
        { message: "Invalid dashboard filters or ordering." },
        { status: 400 }
      )
    }

    const requestBody =
      body.initialize &&
      body.filters.sources.length === 0 &&
      body.filters.experiments.length === 0
        ? {
            ...body,
            initialize: false,
            filters: {
              statuses: [...body.filters.statuses],
              sources: dashboard.sourceDistribution.map((item) => item.source),
              experiments: dashboard.experimentRisk.map(
                (experiment) => experiment.experimentId
              ),
            },
          }
        : body

    return HttpResponse.json(
      projectDashboard(dashboard as Dashboard, requestBody)
    )
  }),
]
