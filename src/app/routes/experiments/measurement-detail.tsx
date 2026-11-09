import { useLocation, useParams } from "react-router"
import { MeasurementDetail } from "@/features/experiments/components/measurement-detail"
import { useMeasurementDetail } from "@/features/experiments/hooks/use-measurement-detail"
import type { MeasurementDetailNavigationState } from "@/features/experiments/types"

const isNavigationState = (
  state: unknown,
): state is MeasurementDetailNavigationState =>
  typeof state === "object" &&
  state !== null &&
  "from" in state &&
  (state.from === "runs" || state.from === "experiment")

export default function MeasurementDetailPage() {
  const { measurementId = "" } = useParams()
  const location = useLocation()
  const detail = useMeasurementDetail(measurementId)
  const navigationState = isNavigationState(location.state)
    ? location.state
    : null

  return (
    <main className="min-h-[calc(100vh-3rem)] bg-background p-4 text-foreground sm:p-6">
      <div className="mx-auto max-w-7xl">
        <MeasurementDetail
          {...detail}
          breadcrumbOrigin={navigationState?.from}
          onRetry={detail.retry}
        />
      </div>
    </main>
  )
}
