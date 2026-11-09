import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { afterEach, describe, expect, it } from "vitest"
import { RunDetailBreadcrumb } from "./run-detail-breadcrumb"

afterEach(cleanup)

describe("run detail breadcrumb", () => {
  it("renders the experiment context by default", () => {
    render(
      <MemoryRouter>
        <RunDetailBreadcrumb
          experimentId="experiment-1"
          experimentName="Checkout ranking"
          runId="run-1"
        />
      </MemoryRouter>,
    )

    expect(screen.getByText("Experiments")).toBeTruthy()
    expect(screen.getByText("experiment-1")).toBeTruthy()
    expect(screen.getByText("Runs").closest("a")?.getAttribute("href")).toBe(
      "/runs?filter=experiment%3ACheckout%20ranking",
    )
    expect(screen.getByText("run-1")).toBeTruthy()
  })

  it("renders only the runs context for runs-index navigation", () => {
    render(
      <MemoryRouter>
        <RunDetailBreadcrumb
          experimentId="experiment-1"
          experimentName="Checkout ranking"
          origin="runs"
          runId="run-1"
        />
      </MemoryRouter>,
    )

    expect(screen.getByText("Runs")).toBeTruthy()
    expect(screen.getByText("run-1")).toBeTruthy()
    expect(screen.queryByText("Experiments")).toBeNull()
    expect(screen.queryByText("experiment-1")).toBeNull()
  })
})
