import { useCallback, useEffect, useState } from "react"
import {
  fetchArtifactContent,
  getArtifact,
  getArtifactDownloadUrl,
} from "@/features/artifacts/api"
import {
  getComparison,
  getExperiment,
  getRun,
  listMeasurements,
  listVariants,
} from "../api"
import type { ComparisonAnalyzerState } from "../types"

const initialState: ComparisonAnalyzerState = {
  comparison: null,
  run: null,
  experiment: null,
  controlMeasurement: null,
  candidateMeasurement: null,
  controlVariant: null,
  candidateVariant: null,
  comparisonArtifact: null,
  comparisonContent: null,
  comparisonError: null,
  controlArtifact: null,
  controlContent: null,
  controlError: null,
  candidateArtifact: null,
  candidateContent: null,
  candidateError: null,
  loading: true,
  error: null,
}

const asError = (error: unknown, fallback: string) =>
  error instanceof Error ? error : new Error(fallback)

async function loadArtifactPreview(artifactId: string, signal: AbortSignal) {
  const artifact = await getArtifact(artifactId, signal)
  const download = await getArtifactDownloadUrl(artifactId, signal)
  const content = await fetchArtifactContent(download.url, signal)
  return { artifact, content }
}

export function useComparisonAnalyzer(comparisonId: string) {
  const [state, setState] = useState(initialState)
  const [attempt, setAttempt] = useState(0)

  const retry = useCallback(() => {
    setState((current) => ({ ...current, loading: true, error: null }))
    setAttempt((value) => value + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    getComparison(comparisonId, controller.signal)
      .then(async (comparison) => {
        const [run, measurementsResponse, variantsResponse] = await Promise.all(
          [
            getRun(comparison.runId, controller.signal),
            listMeasurements(comparison.runId, controller.signal),
            listVariants(undefined, controller.signal),
          ]
        )
        const experiment = await getExperiment(
          run.experimentId,
          controller.signal
        )
        const controlMeasurement =
          measurementsResponse.items.find(
            (measurement) => measurement.id === comparison.controlMeasurementId
          ) ?? null
        const candidateMeasurement =
          measurementsResponse.items.find(
            (measurement) =>
              measurement.id === comparison.candidateMeasurementId
          ) ?? null

        return {
          comparison,
          run,
          experiment,
          controlMeasurement,
          candidateMeasurement,
          controlVariant:
            variantsResponse.items.find(
              (variant) => variant.id === controlMeasurement?.variantId
            ) ?? null,
          candidateVariant:
            variantsResponse.items.find(
              (variant) => variant.id === candidateMeasurement?.variantId
            ) ?? null,
        }
      })
      .then(async (detail) => {
        const previews = [
          {
            key: "comparison" as const,
            artifactId: detail.comparison.outputFileId,
          },
          {
            key: "control" as const,
            artifactId: detail.controlMeasurement?.outputFileId ?? null,
          },
          {
            key: "candidate" as const,
            artifactId: detail.candidateMeasurement?.outputFileId ?? null,
          },
        ]

        const loaded = await Promise.all(
          previews.map(async ({ key, artifactId }) => {
            if (!artifactId) {
              return { key, artifact: null, content: null, error: null }
            }

            try {
              const preview = await loadArtifactPreview(
                artifactId,
                controller.signal
              )
              return { key, ...preview, error: null }
            } catch (error: unknown) {
              if (controller.signal.aborted) return null
              return {
                key,
                artifact: null,
                content: null,
                error: asError(error, `${key} artifact preview unavailable.`),
              }
            }
          })
        )

        if (controller.signal.aborted) return

        const byKey = new Map(
          loaded
            .filter(
              (preview): preview is NonNullable<typeof preview> =>
                preview !== null
            )
            .map((preview) => [preview.key, preview])
        )
        const comparisonPreview = byKey.get("comparison")
        const controlPreview = byKey.get("control")
        const candidatePreview = byKey.get("candidate")

        setState({
          comparison: detail.comparison,
          run: detail.run,
          experiment: detail.experiment,
          controlMeasurement: detail.controlMeasurement,
          candidateMeasurement: detail.candidateMeasurement,
          controlVariant: detail.controlVariant,
          candidateVariant: detail.candidateVariant,
          comparisonArtifact: comparisonPreview?.artifact ?? null,
          comparisonContent: comparisonPreview?.content ?? null,
          comparisonError: comparisonPreview?.error ?? null,
          controlArtifact: controlPreview?.artifact ?? null,
          controlContent: controlPreview?.content ?? null,
          controlError: controlPreview?.error ?? null,
          candidateArtifact: candidatePreview?.artifact ?? null,
          candidateContent: candidatePreview?.content ?? null,
          candidateError: candidatePreview?.error ?? null,
          loading: false,
          error: null,
        })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState((current) => ({
          ...current,
          loading: false,
          error: asError(error, "Comparison unavailable."),
        }))
      })

    return () => controller.abort()
  }, [attempt, comparisonId])

  return { ...state, retry }
}
