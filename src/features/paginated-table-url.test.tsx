import type { PropsWithChildren } from "react"
import { act, renderHook, waitFor } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useExperiments } from "./experiments/hooks/use-experiments"
import { useRuns } from "./runs/hooks/use-runs"

const { listExperiments, listRuns } = vi.hoisted(() => ({
  listExperiments: vi.fn(() =>
    Promise.resolve({
      items: [],
      metadata: { total: 0, limit: 10, offset: 0 },
    }),
  ),
  listRuns: vi.fn(() =>
    Promise.resolve({
      items: [],
      metadata: { total: 0, limit: 10, offset: 0 },
    }),
  ),
}))

vi.mock("./experiments/api", () => ({ listExperiments }))
vi.mock("./runs/api", () => ({ listRuns }))

function createWrapper(
  initialEntry: string,
  onSearchChange: (value: string) => void,
) {
  function LocationObserver() {
    onSearchChange(useLocation().search)
    return null
  }

  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <MemoryRouter initialEntries={[initialEntry]}>
        <LocationObserver />
        {children}
      </MemoryRouter>
    )
  }
}

describe("paginated table URL state", () => {
  beforeEach(() => {
    listExperiments.mockClear()
    listRuns.mockClear()
  })

  it("initializes experiments from shared URL state and updates it", async () => {
    let search = ""
    const { result } = renderHook(() => useExperiments(), {
      wrapper: createWrapper(
        "/experiments?filter=checkout&orderBy=name&orderDirection=asc&limit=25&offset=25",
        (value) => {
          search = value
        },
      ),
    })

    expect(result.current.query).toMatchObject({
      filter: "checkout",
      orderBy: "name",
      orderDirection: "asc",
      limit: 25,
      offset: 25,
    })

    act(() => {
      result.current.updateQuery({ filter: "payments", orderBy: "runCount" })
    })

    await waitFor(() => {
      expect(search).toBe(
        "?filter=payments&orderBy=runCount&orderDirection=asc&limit=25",
      )
    })
  })

  it("initializes runs from shared URL state and preserves pagination changes", async () => {
    let search = ""
    const { result } = renderHook(() => useRuns(), {
      wrapper: createWrapper(
        "/runs?filter=failed&orderBy=endedAt&orderDirection=asc&limit=50",
        (value) => {
          search = value
        },
      ),
    })

    expect(result.current.query).toMatchObject({
      filter: "failed",
      orderBy: "endedAt",
      orderDirection: "asc",
      limit: 50,
      offset: 0,
    })

    act(() => {
      result.current.setPage(2)
    })

    await waitFor(() => {
      expect(search).toBe(
        "?filter=failed&orderBy=endedAt&orderDirection=asc&limit=50&offset=100",
      )
    })
  })

  it("falls back to feature defaults for invalid URL state", () => {
    const { result: experiments } = renderHook(() => useExperiments(), {
      wrapper: createWrapper(
        "/experiments?orderBy=unknown&orderDirection=sideways&limit=15&offset=-1",
        () => undefined,
      ),
    })
    const { result: runs } = renderHook(() => useRuns(), {
      wrapper: createWrapper(
        "/runs?orderBy=unknown&orderDirection=sideways&limit=15&offset=-1",
        () => undefined,
      ),
    })

    expect(experiments.current.query).toMatchObject({
      orderBy: "date",
      orderDirection: "desc",
      limit: 10,
      offset: 0,
    })
    expect(runs.current.query).toMatchObject({
      orderBy: "startedAt",
      orderDirection: "desc",
      limit: 10,
      offset: 0,
    })
  })
})
