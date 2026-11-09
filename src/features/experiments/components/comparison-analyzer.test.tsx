import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { afterEach, describe, expect, it } from "vitest"
import { ThemeProvider } from "@/components/theme-provider"
import { ComparisonAnalyzer } from "./comparison-analyzer"
import type { ComparisonAnalyzerState } from "../types"

afterEach(cleanup)

const analyzerState: ComparisonAnalyzerState = {
  comparison: {
    id: "comparison-1",
    runId: "run-1",
    controlMeasurementId: "measurement-control",
    candidateMeasurementId: "measurement-candidate",
    outputFileId: "artifact-diff",
    outputFormat: "unified-diff",
    createdAt: "2029-12-02T10:15:00Z",
    updatedAt: "2029-12-02T10:15:00Z",
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
  candidateMeasurement: {
    id: "measurement-candidate",
    runId: "run-1",
    variantId: "candidate-1",
    outputFileId: "artifact-candidate",
    outputFormat: "json",
    status: "completed_with_differences",
    error: null,
    startedAt: "2029-12-02T10:01:00Z",
    endedAt: "2029-12-02T10:06:00Z",
    createdAt: "2029-12-02T10:01:00Z",
    updatedAt: "2029-12-02T10:06:00Z",
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
  candidateVariant: {
    id: "candidate-1",
    experimentId: "experiment-1",
    containerImageId: null,
    type: "candidate",
    key: "candidate",
    callable: "ranking.candidate",
    name: "Candidate model",
  },
  comparisonArtifact: {
    id: "artifact-diff",
    bucket: "fixture-bucket",
    objectKey: "comparisons/result.diff",
    filename: "result.diff",
    contentType: "text/x-diff",
    createdAt: "2029-12-02T10:15:00Z",
  },
  comparisonContent: "- score: 0.90\n+ score: 0.92",
  comparisonError: null,
  controlArtifact: {
    id: "artifact-control",
    bucket: "fixture-bucket",
    objectKey: "measurements/control.json",
    filename: "control.json",
    contentType: "application/json",
    createdAt: "2029-12-02T10:05:00Z",
  },
  controlContent: '{"score":0.90}',
  controlError: null,
  candidateArtifact: {
    id: "artifact-candidate",
    bucket: "fixture-bucket",
    objectKey: "measurements/candidate.json",
    filename: "candidate.json",
    contentType: "application/json",
    createdAt: "2029-12-02T10:06:00Z",
  },
  candidateContent: '{"score":0.92}',
  candidateError: null,
  loading: false,
  error: null,
}

describe("comparison analyzer", () => {
  it("renders the canonical relationship breadcrumb", () => {
    render(
      <ThemeProvider defaultTheme="light">
        <MemoryRouter>
          <ComparisonAnalyzer {...analyzerState} onRetry={() => undefined} />
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(
      screen.getByRole("navigation", { name: "breadcrumb" }).textContent,
    ).toContain(
      "Experimentsexperiment-1Runsrun-1Measurementsmeasurement-candidateComparisonscomparison-1",
    )
    expect(screen.getByText("experiment-1").closest("a")?.getAttribute("href")).toBe(
      "/experiments/experiment-1",
    )
    expect(screen.getByText("Runs").closest("a")?.getAttribute("href")).toBe(
      "/runs?filter=experiment%3ACheckout%20ranking",
    )
    expect(
      screen.getByText("measurement-candidate").closest("a")?.getAttribute("href"),
    ).toBe(
      "/experiments/experiment-1/runs/run-1/measurements/measurement-candidate",
    )
  })

  it("renders the diff tab and relationship-resolved output panels", async () => {
    render(
      <ThemeProvider defaultTheme="light">
        <MemoryRouter>
          <ComparisonAnalyzer {...analyzerState} onRetry={() => undefined} />
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(screen.getByRole("tab", { name: "Diff artifact" })).toBeTruthy()
    expect(screen.getByTestId("comparison-diff-view").textContent).toContain(
      "score: 0.90",
    )

    await screen
      .getByRole("tab", { name: "Control and candidate outputs" })
      .click()

    expect(screen.getByText("Control model")).toBeTruthy()
    expect(screen.getByText("Candidate model")).toBeTruthy()
    expect(screen.getByText('{"score":0.90}')).toBeTruthy()
    expect(screen.getByText('{"score":0.92}')).toBeTruthy()
  })
})
