import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { NewRunForm } from "./new-run-form"

const experiments = [
  {
    id: "experiment-1",
    name: "Checkout ranking",
    source: "sales-worker-v3",
    createdAt: "2029-12-01T09:00:00Z",
    updatedAt: "2029-12-06T15:00:00Z",
    runCount: 2,
  },
]

vi.mock("@/features/experiments/api", () => ({
  listExperiments: vi.fn(() => Promise.resolve({ items: experiments })),
}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe("new run form", () => {
  it("requires an experiment but allows an empty input payload", async () => {
    render(<NewRunForm />)

    await waitFor(() => {
      expect(
        screen.getByRole("combobox", { name: "Search experiments" })
      ).toBeTruthy()
    })

    const triggerButton = screen.getByRole("button", { name: /trigger run/i })
    await waitFor(() => {
      expect((triggerButton as HTMLButtonElement).disabled).toBe(false)
    })
    fireEvent.click(triggerButton)

    expect(screen.getByRole("alert").textContent).toContain(
      "Choose an experiment"
    )
  })

  it("shows searchable experiments and common serializable formats", async () => {
    render(<NewRunForm />)

    const experimentInput = await screen.findByRole("combobox", {
      name: "Search experiments",
    })
    fireEvent.focus(experimentInput)
    fireEvent.click(screen.getByRole("button", { name: "Show experiments" }))

    expect(
      await screen.findByRole("option", { name: /checkout ranking/i })
    ).toBeTruthy()

    const formatOptions = Array.from(
      document.querySelectorAll("#run-input-formats option")
    ).map((option) => option.getAttribute("value"))
    expect(formatOptions).toEqual(
      expect.arrayContaining(["json", "csv", "txt", "xml"])
    )
  })
})
