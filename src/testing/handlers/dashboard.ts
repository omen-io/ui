import { http, HttpResponse } from "msw"

import dashboard from "@/testing/fixtures/dashboard/dashboard.json"

export const dashboardHandlers = [
  http.get("/api/v1/dashboard", () => HttpResponse.json(dashboard)),
]
