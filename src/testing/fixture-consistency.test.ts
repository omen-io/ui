import { describe, expect, it } from "vitest"
import dashboard from "./fixtures/dashboard/dashboard.json"
import artifacts from "./fixtures/experiments/artifacts.json"
import comparisons from "./fixtures/experiments/comparisons.json"
import experiments from "./fixtures/experiments/experiments.json"
import measurements from "./fixtures/experiments/measurements.json"
import runs from "./fixtures/experiments/runs.json"
import variants from "./fixtures/experiments/variants.json"

const measurementFiles = import.meta.glob(
  "./fixtures/files/measurements/*",
  { eager: true, import: "default", query: "?raw" },
) as Record<string, string>
const comparisonFiles = import.meta.glob(
  "./fixtures/files/comparisons/*",
  { eager: true, import: "default", query: "?raw" },
) as Record<string, string>

const measurementById = new Map(measurements.items.map((item) => [item.id, item]))
const runById = new Map(runs.items.map((item) => [item.id, item]))
const experimentById = new Map(experiments.items.map((item) => [item.id, item]))
const artifactById = new Map(artifacts.items.map((item) => [item.id, item]))
const variantById = new Map(variants.items.map((item) => [item.id, item]))

const getOutput = (measurementId: string) => {
  const measurement = measurementById.get(measurementId)
  if (!measurement?.outputFileId) return null

  const artifact = artifactById.get(measurement.outputFileId)
  if (!artifact) return null

  return measurementFiles[
    `./fixtures/files/${artifact.objectKey}`
  ]
}

const candidateStatusFor = (controlId: string, candidateId: string) =>
  getOutput(controlId) === getOutput(candidateId)
    ? "completed"
    : "completed_with_differences"

describe("fixture consistency", () => {
  it("keeps comparison lifecycle and output status consistent", () => {
    for (const comparison of comparisons.items) {
      const control = measurementById.get(comparison.controlMeasurementId)
      const candidate = measurementById.get(comparison.candidateMeasurementId)

      expect(control).toMatchObject({ runId: comparison.runId, status: "completed" })
      expect(candidate).toMatchObject({
        runId: comparison.runId,
        status: candidateStatusFor(
          comparison.controlMeasurementId,
          comparison.candidateMeasurementId,
        ),
      })
      expect(control?.outputFileId).toBeTruthy()
      expect(candidate?.outputFileId).toBeTruthy()
      const comparisonArtifact = comparison.outputFileId
        ? artifactById.get(comparison.outputFileId)
        : null
      expect(comparisonArtifact).toBeTruthy()
      expect(
        comparisonFiles[`./fixtures/files/${comparisonArtifact!.objectKey}`],
      ).toBeTruthy()
    }

    for (const measurement of measurements.items) {
      const hasComparison = comparisons.items.some(
        (comparison) =>
          comparison.controlMeasurementId === measurement.id ||
          comparison.candidateMeasurementId === measurement.id,
      )

      if (measurement.status === "in_progress" || measurement.status === "failed") {
        expect(hasComparison).toBe(false)
      }
    }
  })

  it("aggregates measurement outcomes into run statuses and dashboard projections", () => {
    const statusCounts = new Map<string, Record<string, number>>()
    const frequency = new Map<string, number>()

    for (const run of runs.items) {
      const runMeasurements = measurements.items.filter(
        (measurement) => measurement.runId === run.id,
      )
      expect(
        runMeasurements.some(
          (measurement) => variantById.get(measurement.variantId)?.type === "control",
        ),
      ).toBe(true)
      if (runMeasurements.length > 0) {
        const expectedStatus = runMeasurements.some(
          (measurement) =>
            measurement.status === "completed_with_differences",
        )
          ? "completed_with_differences"
          : runMeasurements.some(
                (measurement) => measurement.status === "failed",
              )
            ? "failed"
            : runMeasurements.some(
                  (measurement) => measurement.status === "in_progress",
                )
              ? "in_progress"
              : "completed"

        expect(run.status).toBe(expectedStatus)
      }

      if (run.status === "completed") {
        expect(
          runMeasurements.some(
            (measurement) =>
              measurement.status === "completed" &&
              variantById.get(measurement.variantId)?.type === "control",
          ),
        ).toBe(true)
        expect(
          runMeasurements.some(
            (measurement) =>
              measurement.status === "completed" &&
              variantById.get(measurement.variantId)?.type === "candidate",
          ),
        ).toBe(true)
      }

      if (run.status === "failed") {
        expect(
          runMeasurements.some((measurement) => measurement.status === "failed"),
        ).toBe(true)
      }

      const experiment = experimentById.get(run.experimentId)
      expect(experiment).toBeTruthy()
      const sourceCounts = statusCounts.get(experiment!.source) ?? {}
      sourceCounts[run.status] = (sourceCounts[run.status] ?? 0) + 1
      statusCounts.set(experiment!.source, sourceCounts)

      const date = run.startedAt?.slice(0, 10)
      if (date) {
        const key = `${date}|${experiment!.source}|${run.status}|${run.experimentId}`
        frequency.set(key, (frequency.get(key) ?? 0) + 1)
      }
    }

    expect(dashboard.summary.totalRunCount).toBe(runs.items.length)
    expect(dashboard.summary.notCompletedRunCount).toBe(
      runs.items.filter((run) => run.status !== "completed").length,
    )

    for (const source of dashboard.sourceDistribution) {
      const expected = statusCounts.get(source.source) ?? {}
      expect(source.runCount).toBe(
        Object.values(expected).reduce((total, count) => total + count, 0),
      )
      expect(source.statusCounts).toEqual({
        completed: expected.completed ?? 0,
        completed_with_differences: expected.completed_with_differences ?? 0,
        in_progress: expected.in_progress ?? 0,
        failed: expected.failed ?? 0,
      })
    }

    for (const row of dashboard.runFrequency) {
      const key = `${row.date}|${row.source}|${row.status}|${row.experimentId}`
      expect(frequency.get(key)).toBe(row.count)
      frequency.delete(key)
    }
    expect(frequency.size).toBe(0)
  })

  it("treats identical comparison outputs as completed", () => {
    expect(candidateStatusFor("missing-control", "missing-candidate")).toBe(
      "completed",
    )
  })

  it("includes a failed run with both completed and failed measurements", () => {
    const runMeasurements = measurements.items.filter(
      (measurement) =>
        measurement.runId === "00000000-0000-0000-0000-000000000023",
    )

    expect(runMeasurements.map((measurement) => measurement.status)).toEqual([
      "completed",
      "failed",
    ])
  })

  it("keeps every run and measurement reference valid", () => {
    for (const run of runs.items) {
      expect(runById.get(run.id)).toBe(run)
      expect(experimentById.has(run.experimentId)).toBe(true)
    }

    for (const measurement of measurements.items) {
      expect(runById.has(measurement.runId)).toBe(true)
      if (measurement.outputFileId) {
        const artifact = artifactById.get(measurement.outputFileId)
        expect(artifact).toBeTruthy()
        expect(
          measurementFiles[`./fixtures/files/${artifact!.objectKey}`],
        ).toBeTruthy()
      }
      expect(variantById.has(measurement.variantId)).toBe(true)
    }
  })
})
