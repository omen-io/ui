import { cleanup, render, screen, within } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { afterEach, describe, expect, it } from "vitest"
import { MeasurementDetail } from "./measurement-detail"
import type { MeasurementDetailState } from "../types"

afterEach(cleanup)

const baseDetail: MeasurementDetailState = {
  measurement: {
    id: "measurement-1",
    runId: "run-1",
    variantId: "candidate-1",
    outputFileId: "artifact-output",
    outputFormat: "json",
    status: "completed",
    error: null,
    startedAt: "2029-12-02T10:01:00Z",
    endedAt: "2029-12-02T10:06:00Z",
    createdAt: "2029-12-02T10:01:00Z",
    updatedAt: "2029-12-02T10:06:00Z",
  },
  run: {
    id: "run-1",
    experimentId: "experiment-1",
    inputFileId: "input-1",
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
    createdAt: "2029-12-01T08:30:00Z",
    updatedAt: "2029-12-02T10:12:00Z",
  },
  variant: {
    id: "candidate-1",
    experimentId: "experiment-1",
    containerImageId: null,
    type: "candidate",
    key: "candidate",
    callable: "ranking.candidate",
    name: "Candidate model",
  },
  controlMeasurement: {
    id: "measurement-control",
    runId: "run-1",
    variantId: "control-1",
    outputFileId: "artifact-control",
    outputFormat: "json",
    status: "completed",
    error: null,
    startedAt: "2029-12-02T10:00:00Z",
    endedAt: "2029-12-02T10:05:00Z",
    createdAt: "2029-12-02T10:00:00Z",
    updatedAt: "2029-12-02T10:05:00Z",
  },
  controlVariant: {
    id: "control-1",
    experimentId: "experiment-1",
    containerImageId: null,
    type: "control",
    key: "control",
    callable: "ranking.control",
    name: "Control model",
  },
  outputArtifact: {
    id: "artifact-output",
    bucket: "fixture-bucket",
    objectKey: "outputs/result.json",
    filename: "result.json",
    contentType: "application/json",
    createdAt: "2029-12-02T10:06:00Z",
  },
  outputContent: '{"score":0.92}',
  outputError: null,
  comparison: {
    id: "comparison-1",
    runId: "run-1",
    controlMeasurementId: "measurement-control",
    candidateMeasurementId: "measurement-1",
    outputFileId: "artifact-comparison",
    outputFormat: "unified-diff",
    createdAt: "2029-12-02T10:15:00Z",
    updatedAt: "2029-12-02T10:15:00Z",
  },
  comparisonArtifact: {
    id: "artifact-comparison",
    bucket: "fixture-bucket",
    objectKey: "comparisons/result.diff",
    filename: "result.diff",
    contentType: "text/plain",
    createdAt: "2029-12-02T10:15:00Z",
  },
  comparisonContent: "- score: 0.90\n+ score: 0.92",
  comparisonError: null,
  loading: false,
  error: null,
}

describe("measurement detail", () => {
  it("renders output and candidate comparison preview", () => {
    render(
      <MemoryRouter>
        <MeasurementDetail {...baseDetail} onRetry={() => undefined} />
      </MemoryRouter>,
    )

    expect(screen.getByText("Output preview")).toBeTruthy()
    expect(screen.getAllByText("result.json")).toHaveLength(2)
    expect(screen.getAllByText("application/json")).toHaveLength(2)
    expect(screen.getByText('{"score":0.92}')).toBeTruthy()
    expect(screen.queryByText("Output format")).toBeNull()
    expect(screen.getByText("Comparison with control")).toBeTruthy()
    expect(screen.getByText("result.diff")).toBeTruthy()
    expect(
      screen.getByRole("button", { name: /open full comparison/i }).getAttribute(
        "href",
      ),
    ).toBe(
      "/experiments/experiment-1/runs/run-1/comparisons/comparison-1",
    )
  })

  it("renders a failed measurement error instead of an output preview", () => {
    render(
      <MemoryRouter>
        <MeasurementDetail
          {...baseDetail}
          measurement={{
            ...baseDetail.measurement!,
            status: "failed",
            outputFileId: null,
            error: "Candidate returned an invalid score.",
          }}
          outputArtifact={null}
          outputContent={null}
          onRetry={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText("Measurement error")).toBeTruthy()
    expect(screen.getByText("Candidate returned an invalid score.")).toBeTruthy()
    expect(screen.queryByText("Output preview")).toBeNull()
  })

  it("preserves runs-index breadcrumb origin", () => {
    render(
      <MemoryRouter>
        <MeasurementDetail
          {...baseDetail}
          breadcrumbOrigin="runs"
          onRetry={() => undefined}
        />
      </MemoryRouter>,
    )

    const breadcrumb = screen.getByRole("navigation", { name: "breadcrumb" })
    expect(within(breadcrumb).getByText("Runs")).toBeTruthy()
    expect(within(breadcrumb).getByText("run-1")).toBeTruthy()
    expect(within(breadcrumb).getByText("Measurements")).toBeTruthy()
    expect(within(breadcrumb).getByText("measurement-1")).toBeTruthy()
    expect(within(breadcrumb).queryByText("Experiments")).toBeNull()
  })
})
