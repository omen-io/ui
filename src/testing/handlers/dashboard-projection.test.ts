import { describe, expect, it } from "vitest"
import dashboard from "@/testing/fixtures/dashboard/dashboard.json"
import {
  defaultDashboardRequest,
  projectDashboard,
  STATUSES,
} from "@/testing/handlers/dashboard-projection"
import type { Dashboard, DashboardRequest } from "@/features/dashboard/types"

const fixture = dashboard as Dashboard
const all = defaultDashboardRequest(fixture)

describe("projectDashboard", () => {
  it("preserves the unfiltered aggregate values and deterministic ordering", () => {
    const response = projectDashboard(fixture, all)

    expect(response.metadata.hasSelection).toBe(true)
    expect(response.metadata.summary.totalRunCount).toBe(22)
    expect(response.data.pieChart).toEqual([
      { status: "completed", count: 3 },
      { status: "completed_with_differences", count: 12 },
      { status: "in_progress", count: 1 },
      { status: "failed", count: 6 },
    ])
    expect(response.data.sourceChart.map((source) => source.source)).toEqual([
      "search-worker-v2",
      "sales-worker-v3",
      "observability-agent-v1",
      "payments-worker-v2",
      "accounting-io-v1",
    ])
    expect(response.data.experimentChart.rows.map((row) => row.name)).toEqual([
      "Search relevance",
      "Checkout ranking",
      "Latency guardrails",
      "Payment authorization",
      "Telemetry sampling",
    ])
  })

  it("keeps pie counts independent from selected statuses", () => {
    const response = projectDashboard(fixture, {
      ...all,
      filters: { ...all.filters, statuses: ["completed"] },
    })

    expect(response.data.pieChart.map((item) => item.count)).toEqual([
      3, 12, 1, 6,
    ])
    expect(response.data.sourceChart.map((source) => source.runCount)).toEqual([
      2, 1, 0, 0, 0,
    ])
    expect(
      response.data.experimentChart.rows.map((row) => row.incompleteCount)
    ).toEqual([0, 0, 0, 0, 0])
    expect(response.data.experimentChart.emptyState).toBe(true)
  })

  it("keeps source cards at zero when all experiments for a source are cleared", () => {
    const request: DashboardRequest = {
      ...all,
      filters: {
        ...all.filters,
        experiments: all.filters.experiments.filter(
          (id) => id !== "00000000-0000-0000-0000-000000000002"
        ),
      },
    }
    const response = projectDashboard(fixture, request)
    const search = response.data.sourceChart.find(
      (source) => source.source === "search-worker-v2"
    )

    expect(search).toMatchObject({
      runCount: 0,
      statusCounts: {
        completed: 0,
        completed_with_differences: 0,
        in_progress: 0,
        failed: 0,
      },
    })
  })

  it("requires all three selections for the run chart", () => {
    const response = projectDashboard(fixture, {
      ...all,
      filters: { ...all.filters, sources: [] },
    })

    expect(response.metadata.hasSelection).toBe(false)
    expect(response.data.runChart).toEqual(
      [...new Set(fixture.runFrequency.map((item) => item.date))].map(
        (date) => ({ date })
      )
    )
  })

  it("handles empty selections without inventing matching data", () => {
    const response = projectDashboard(fixture, {
      ...all,
      filters: { statuses: [], sources: [], experiments: [] },
    })

    expect(response.metadata.hasSelection).toBe(false)
    expect(response.data.pieChart.map((item) => item.count)).toEqual([
      0, 0, 0, 0,
    ])
    expect(
      response.data.sourceChart.every((source) => source.runCount === 0)
    ).toBe(true)
    expect(response.data.experimentChart.rows).toEqual([])
    expect(response.data.experimentChart.emptyState).toBe(true)
    expect(STATUSES).toHaveLength(4)
  })
})
