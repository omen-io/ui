import { useCallback, useEffect, useState } from "react"
import {
  fetchArtifactContent,
  getArtifact,
  getArtifactDownloadUrl,
} from "@/features/artifacts/api"
import {
  getExperiment,
  getMeasurement,
  getRun,
  listComparisons,
  listMeasurements,
  listVariants,
} from "../api"
import type { MeasurementDetailState } from "../types"

const initialState: MeasurementDetailState = {
  measurement: null,
  run: null,
  experiment: null,
  variant: null,
  controlMeasurement: null,
  controlVariant: null,
  outputArtifact: null,
  outputContent: null,
  outputError: null,
  comparison: null,
  comparisonArtifact: null,
  comparisonContent: null,
  comparisonError: null,
  loading: true,
  error: null,
}

const asError = (error: unknown, fallback: string) =>
  error instanceof Error ? error : new Error(fallback)

async function loadArtifactPreview(
  artifactId: string,
  signal: AbortSignal,
) {
  const artifact = await getArtifact(artifactId, signal)
  const download = await getArtifactDownloadUrl(artifactId, signal)
  const content = await fetchArtifactContent(download.url, signal)
  return { artifact, content }
}

export function useMeasurementDetail(measurementId: string) {
  const [state, setState] = useState(initialState)
  const [attempt, setAttempt] = useState(0)

  const retry = useCallback(() => {
    setState((current) => ({ ...current, loading: true, error: null }))
    setAttempt((value) => value + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    getMeasurement(measurementId, controller.signal)
      .then(async (measurement) => {
        const run = await getRun(measurement.runId, controller.signal)
        if (!run) throw new Error("Run not found.")

        const [experiment, measurementsResponse, variantsResponse, comparisonsResponse] =
          await Promise.all([
            getExperiment(run.experimentId, controller.signal),
            listMeasurements(measurement.runId, controller.signal),
            listVariants(undefined, controller.signal),
            listComparisons(controller.signal),
          ])

        if (!experiment) throw new Error("Experiment not found.")

        const currentVariant = variantsResponse.items.find(
          (variant) => variant.id === measurement.variantId,
        )
        const comparison =
          currentVariant?.type === "candidate"
            ? (comparisonsResponse.items.find(
                (item) => item.candidateMeasurementId === measurement.id,
              ) ?? null)
            : null
        const controlMeasurement = comparison
          ? (measurementsResponse.items.find(
              (item) => item.id === comparison.controlMeasurementId,
            ) ?? null)
          : null
        const controlVariant = controlMeasurement
          ? (variantsResponse.items.find(
              (variant) => variant.id === controlMeasurement.variantId,
            ) ?? null)
          : null

        return {
          measurement,
          run,
          experiment,
          variant: currentVariant ?? null,
          controlMeasurement,
          controlVariant,
          comparison,
          variantsResponse,
        }
      })
      .then(async (detail) => {
        let outputArtifact = null
        let outputContent = null
        let outputError = null
        if (detail.measurement.outputFileId) {
          try {
            const preview = await loadArtifactPreview(
              detail.measurement.outputFileId,
              controller.signal,
            )
            outputArtifact = preview.artifact
            outputContent = preview.content
          } catch (error: unknown) {
            if (controller.signal.aborted) return
            outputError = asError(error, "Output preview unavailable.")
          }
        }

        let comparisonArtifact = null
        let comparisonContent = null
        let comparisonError = null
        if (detail.comparison?.outputFileId) {
          try {
            const preview = await loadArtifactPreview(
              detail.comparison.outputFileId,
              controller.signal,
            )
            comparisonArtifact = preview.artifact
            comparisonContent = preview.content
          } catch (error: unknown) {
            if (controller.signal.aborted) return
            comparisonError = asError(error, "Comparison preview unavailable.")
          }
        }

        if (controller.signal.aborted) return
        setState({
          measurement: detail.measurement,
          run: detail.run,
          experiment: detail.experiment,
          variant: detail.variant,
          controlMeasurement: detail.controlMeasurement,
          controlVariant: detail.controlVariant,
          outputArtifact,
          outputContent,
          outputError,
          comparison: detail.comparison,
          comparisonArtifact,
          comparisonContent,
          comparisonError,
          loading: false,
          error: null,
        })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState((current) => ({
          ...current,
          loading: false,
          error: asError(error, "Measurement unavailable."),
        }))
      })

    return () => controller.abort()
  }, [attempt, measurementId])

  return { ...state, retry }
}
