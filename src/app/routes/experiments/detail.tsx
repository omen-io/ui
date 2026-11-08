import { useParams } from "react-router"
import { ExperimentDetail } from "@/features/experiments/components/experiment-detail"
import { useExperimentDetail } from "@/features/experiments/hooks/use-experiment-detail"

export default function ExperimentDetailPage() {
  const { experimentId = "" } = useParams()
  const detail = useExperimentDetail(experimentId)

  return (
    <main className="min-h-[calc(100vh-3rem)] bg-background p-4 text-foreground sm:p-6">
      <div className="mx-auto max-w-7xl">
        <ExperimentDetail {...detail} onRetry={detail.retry} />
      </div>
    </main>
  )
}
