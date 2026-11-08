import { useCallback, useEffect, useState } from "react"
import { getExperiment, listRuns, listVariants } from "../api"
import type { Experiment, Run, Variant } from "../types"

type ExperimentDetailState = {
  experiment: Experiment | null
  runs: Run[]
  variants: Variant[]
  loading: boolean
  error: Error | null
}

const initialState: ExperimentDetailState = {
  experiment: null,
  runs: [],
  variants: [],
  loading: true,
  error: null,
}

export function useExperimentDetail(experimentId: string) {
  const [state, setState] = useState(initialState)
  const [attempt, setAttempt] = useState(0)

  const retry = useCallback(() => {
    setState((current) => ({ ...current, loading: true, error: null }))
    setAttempt((value) => value + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([
      getExperiment(experimentId, controller.signal),
      listRuns(experimentId, controller.signal),
      listVariants(experimentId, controller.signal),
    ])
      .then(([experiment, runsResponse, variantsResponse]) => {
        setState({
          experiment,
          runs: runsResponse.items
            .slice()
            .sort(
              (left, right) =>
                Date.parse(right.startedAt ?? right.createdAt) -
                Date.parse(left.startedAt ?? left.createdAt)
            ),
          variants: variantsResponse.items,
          loading: false,
          error: null,
        })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState((current) => ({
          ...current,
          loading: false,
          error: error instanceof Error ? error : new Error("Request failed."),
        }))
      })

    return () => controller.abort()
  }, [attempt, experimentId])

  return { ...state, retry }
}
