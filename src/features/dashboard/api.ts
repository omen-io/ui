import { request } from "@/lib/http-client"
import {
  DASHBOARD_STATUSES,
  type DashboardRequest,
  type DashboardResponse,
} from "./types"

export const initialDashboardRequest = (): DashboardRequest => ({
  initialize: true,
  filters: { statuses: [...DASHBOARD_STATUSES], sources: [], experiments: [] },
  ordering: {
    sources: { field: "runCount", direction: "desc" },
    experiments: [
      { field: "incompletePercentage", direction: "desc" },
      { field: "incompleteCount", direction: "desc" },
      { field: "name", direction: "asc" },
      { field: "experimentId", direction: "asc" },
    ],
  },
})

export const postDashboard = (body: DashboardRequest) =>
  request<DashboardResponse>("/api/v1/dashboard", {
    method: "POST",
    body,
  })
