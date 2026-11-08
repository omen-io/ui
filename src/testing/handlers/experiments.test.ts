import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest"
import { setupServer } from "msw/node"
import { experimentHandlers } from "./experiments"

const server = setupServer(...experimentHandlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe("experiment handler", () => {
  it("filters, orders, projects run counts, and paginates experiments", async () => {
    const response = await fetch(
      "http://localhost/api/v1/experiments?filter=source:worker&orderBy=runCount&orderDirection=desc&limit=1&offset=0",
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.metadata).toEqual({ total: 3, limit: 1, offset: 0 })
    expect(body.items).toHaveLength(1)
    expect(body.items[0]).toMatchObject({
      id: "00000000-0000-0000-0000-000000000002",
      runCount: 9,
    })
  })

  it("rejects unsupported pagination and ordering values", async () => {
    const response = await fetch(
      "http://localhost/api/v1/experiments?orderBy=unknown&limit=0",
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      message: "Invalid experiment list query.",
    })
  })

  it("joins, filters, orders, and paginates runs", async () => {
    const response = await fetch(
      "http://localhost/api/v1/runs?filter=status:failed&orderBy=startedAt&orderDirection=asc&limit=2&offset=0",
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.metadata).toEqual({ total: 6, limit: 2, offset: 0 })
    expect(body.items).toHaveLength(2)
    expect(body.items[0]).toMatchObject({
      id: "00000000-0000-0000-0000-000000000013",
      experimentName: "Search relevance",
      experimentSource: "search-worker-v2",
      status: "failed",
    })
  })
})
