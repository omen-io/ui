import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { afterEach, describe, expect, it } from "vitest"
import { RunsHeader } from "./runs-header"

afterEach(cleanup)

describe("runs header", () => {
  it("renders only the runs breadcrumb", () => {
    render(
      <MemoryRouter>
        <RunsHeader />
      </MemoryRouter>,
    )

    const breadcrumb = screen.getByRole("navigation", { name: "breadcrumb" })
    expect(breadcrumb.textContent).toBe("Runs")
  })
})
