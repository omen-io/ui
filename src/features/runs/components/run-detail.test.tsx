import { cleanup, render, screen, within } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { afterEach, describe, expect, it } from "vitest"
import { ArtifactViewer } from "@/features/artifacts/components/artifact-viewer"
import { RunDetail } from "./run-detail"
import type { RunDetailState } from "../types"

afterEach(cleanup)

const detail: RunDetailState = {
  run: {
    id: "run-1",
    experimentId: "experiment-1",
    inputFileId: "artifact-1",
    inputFormat: "json",
    status: "completed",
    startedAt: "2029-12-02T10:00:00Z",
    endedAt: "2029-12-02T10:12:00Z",
    createdAt: "2029-12-02T09:55:00Z",
    updatedAt: "2029-12-02T10:12:00Z",
  },
  experiment: {
    id: "experiment-1",
    name: "Checkout ranking",
    source: "search-worker-v2",
  },
  measurements: [
    {
      id: "measurement-1",
      runId: "run-1",
      variantId: "variant-1",
      outputFileId: null,
      outputFormat: "json",
      status: "completed",
      error: null,
      startedAt: "2029-12-02T10:01:00Z",
      endedAt: "2029-12-02T10:06:00Z",
    },
  ],
  variants: [
    {
      id: "variant-1",
      name: "Control",
      type: "control",
      callable: "ranking.control",
    },
  ],
  artifact: {
    id: "artifact-1",
    bucket: "fixture-bucket",
    objectKey: "inputs/checkout-sample.json",
    filename: "checkout-sample.json",
    contentType: "application/json",
    createdAt: "2029-12-01T08:30:00Z",
  },
  artifactContent: '{"query":"shoes"}',
  artifactError: null,
  loading: false,
  error: null,
}

describe("run detail", () => {
  it("renders nested context, measurement details, and artifact navigation", () => {
    render(
      <MemoryRouter>
        <RunDetail {...detail} onRetry={() => undefined} />
      </MemoryRouter>,
    )

    expect(screen.getByText("Experiments")).toBeTruthy()
    expect(screen.getAllByText("experiment-1")).toHaveLength(1)
    expect(screen.getAllByText("run-1")).toHaveLength(1)
    expect(screen.getAllByText("Control")).toHaveLength(2)
    expect(screen.getByText("ranking.control")).toBeTruthy()
    expect(
      screen.getByRole("button", { name: /open input file/i }).getAttribute(
        "href",
      ),
    ).toBe("/artifacts/artifact-1")
  })

  it("renders the runs breadcrumb when entered from the runs index", () => {
    render(
      <MemoryRouter>
        <RunDetail
          {...detail}
          breadcrumbOrigin="runs"
          onRetry={() => undefined}
        />
      </MemoryRouter>,
    )

    const breadcrumb = screen.getByRole("navigation", { name: "breadcrumb" })
    expect(within(breadcrumb).getByText("Runs")).toBeTruthy()
    expect(within(breadcrumb).getByText("run-1")).toBeTruthy()
    expect(within(breadcrumb).queryByText("Experiments")).toBeNull()
  })

  it("does not render binary artifact content as text", () => {
    render(
      <ArtifactViewer
        artifact={{
          ...detail.artifact!,
          contentType: "application/octet-stream",
        }}
        content="binary content"
      />,
    )

    expect(screen.getByText("Preview unavailable")).toBeTruthy()
    expect(screen.queryByText("binary content")).toBeNull()
  })

  it("does not render malformed object content as a React child", () => {
    render(
      <ArtifactViewer
        artifact={detail.artifact}
        content={
          { requestId: "search-2001", query: "shoes" } as unknown as string
        }
      />,
    )

    expect(screen.getByText("Preview unavailable")).toBeTruthy()
  })
})
