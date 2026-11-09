import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { afterEach, describe, expect, it } from "vitest"
import { ExperimentsHeader } from "./experiments-header"

afterEach(cleanup)

describe("experiments header", () => {
  it("renders only the experiments breadcrumb", () => {
    render(
      <MemoryRouter>
        <ExperimentsHeader />
      </MemoryRouter>,
    )

    const breadcrumb = screen.getByRole("navigation", { name: "breadcrumb" })
    expect(breadcrumb.textContent).toBe("Experiments")
  })
})
