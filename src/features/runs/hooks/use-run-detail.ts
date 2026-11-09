import { useCallback, useEffect, useState } from "react"
import {
  fetchArtifactContent,
  getArtifact,
  getArtifactDownloadUrl,
} from "@/features/artifacts/api"
import {
  getRun,
  getRunExperiment,
  listRunMeasurements,
  listRunVariants,
} from "../api"
import type { RunDetailState } from "../types"

const initialState: RunDetailState = {
  run: null,
  experiment: null,
  measurements: [],
  variants: [],
  artifact: null,
  artifactContent: null,
  artifactError: null,
  loading: true,
  error: null,
}

export function useRunDetail(runId: string) {
  const [state, setState] = useState(initialState)
  const [attempt, setAttempt] = useState(0)

  const retry = useCallback(() => {
    setState((current) => ({ ...current, loading: true, error: null }))
    setAttempt((value) => value + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    getRun(runId, controller.signal)
      .then((run) => {
        if (!run) throw new Error("Run not found.")

        return Promise.all([
          run,
          getRunExperiment(run.experimentId, controller.signal),
          listRunMeasurements(run.id, controller.signal),
          listRunVariants(run.experimentId, controller.signal),
          getArtifact(run.inputFileId, controller.signal),
        ])
      })
      .then(
        async ([
          run,
          experiment,
          measurementsResponse,
          variantsResponse,
          artifact,
        ]) => {
          let artifactContent: string | null = null
          let artifactError: Error | null = null

          try {
            const download = await getArtifactDownloadUrl(
              run.inputFileId,
              controller.signal,
            )
            artifactContent = await fetchArtifactContent(
              download.url,
              controller.signal,
            )
          } catch (error: unknown) {
            if (controller.signal.aborted) return
            artifactError =
              error instanceof Error
                ? error
                : new Error("Artifact preview unavailable.")
          }

          if (controller.signal.aborted) return
          setState({
            run,
            experiment,
            measurements: measurementsResponse.items,
            variants: variantsResponse.items,
            artifact,
            artifactContent,
            artifactError,
            loading: false,
            error: null,
          })
        },
      )
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState((current) => ({
          ...current,
          loading: false,
          error: error instanceof Error ? error : new Error("Request failed."),
        }))
      })

    return () => controller.abort()
  }, [attempt, runId])

  return { ...state, retry }
}
