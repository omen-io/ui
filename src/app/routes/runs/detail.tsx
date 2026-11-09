import { useLocation, useParams } from "react-router"
import { RunDetail } from "@/features/runs/components/run-detail"
import { useRunDetail } from "@/features/runs/hooks/use-run-detail"
import type { RunDetailNavigationState } from "@/features/runs/types"

const isRunDetailNavigationState = (
  state: unknown,
): state is RunDetailNavigationState =>
  typeof state === "object" &&
  state !== null &&
  "from" in state &&
  (state.from === "runs" || state.from === "experiment")

export default function RunDetailPage() {
  const { runId = "" } = useParams()
  const location = useLocation()
  const detail = useRunDetail(runId)
  const navigationState = isRunDetailNavigationState(location.state)
    ? location.state
    : null

  return (
    <main className="min-h-[calc(100vh-3rem)] bg-background p-4 text-foreground sm:p-6">
      <div className="mx-auto max-w-7xl">
        <RunDetail
          {...detail}
          breadcrumbOrigin={navigationState?.from}
          onRetry={detail.retry}
        />
      </div>
    </main>
  )
}
