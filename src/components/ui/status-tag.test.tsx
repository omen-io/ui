import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { StatusTag } from "./status-tag"

describe("StatusTag", () => {
  it.each([
    ["completed", "COMP"],
    ["completed_with_differences", "DIFF"],
    ["in_progress", "PEND"],
    ["failed", "FAIL"],
  ])("renders %s as %s", (status, label) => {
    render(<StatusTag status={status} />)

    expect(screen.getByText(label)).toBeTruthy()
  })

  it("keeps unknown statuses visible without applying a standard color", () => {
    render(<StatusTag status="cancelled" />)

    expect(
      screen.getByText("Cancelled").closest('[data-slot="badge"]')?.className
    ).toContain("bg-secondary")
  })

  it("renders an optional suffix beside the status text", () => {
    render(<StatusTag status="completed" suffix={7} />)

    const badges = document.querySelectorAll('[data-slot="badge"]')
    expect(badges.item(badges.length - 1).textContent).toBe("COMP7")
  })
})
