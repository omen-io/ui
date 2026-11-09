import { useEffect, useState } from "react"
import { listExperiments } from "@/features/experiments/api"
import type { ExperimentListItem } from "@/features/experiments/types"

export function useNewRun() {
  const [experimentSearch, setExperimentSearch] = useState("")
  const [experiments, setExperiments] = useState<ExperimentListItem[]>([])
  const [selectedExperiment, setSelectedExperiment] =
    useState<ExperimentListItem | null>(null)
  const [loadingExperiments, setLoadingExperiments] = useState(true)
  const [experimentsError, setExperimentsError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      void listExperiments({
        filter: experimentSearch,
        orderBy: "name",
        orderDirection: "asc",
        limit: 50,
        signal: controller.signal,
      })
        .then((response) => setExperiments(response.items))
        .catch(() => {
          if (controller.signal.aborted) {
            return
          }
          setExperimentsError(true)
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoadingExperiments(false)
          }
        })
    }, 150)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [experimentSearch])

  const updateExperimentSearch = (value: string) => {
    setExperimentSearch(value)
    setLoadingExperiments(true)
    setExperimentsError(false)
  }

  return {
    experimentSearch,
    updateExperimentSearch,
    experiments,
    selectedExperiment,
    setSelectedExperiment,
    loadingExperiments,
    experimentsError,
  }
}
