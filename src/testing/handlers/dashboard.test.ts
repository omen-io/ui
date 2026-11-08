import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest"
import { setupServer } from "msw/node"
import { initialDashboardRequest } from "@/features/dashboard/api"
import { dashboardHandlers } from "./dashboard"

const server = setupServer(...dashboardHandlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe("dashboard handler", () => {
  it("returns the tailored four-section response for the initial request", async () => {
    const response = await fetch("http://localhost/api/v1/dashboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(initialDashboardRequest()),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toHaveProperty("metadata")
    expect(body).toHaveProperty("data.pieChart")
    expect(body).toHaveProperty("data.sourceChart")
    expect(body).toHaveProperty("data.runChart")
    expect(body).toHaveProperty("data.experimentChart")
    expect(body.metadata.hasSelection).toBe(true)
  })

  it("rejects malformed filter or ordering payloads", async () => {
    const response = await fetch("http://localhost/api/v1/dashboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filters: {}, ordering: {} }),
    })

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      message: "Invalid dashboard filters or ordering.",
    })
  })
})
