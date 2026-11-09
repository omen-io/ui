import type { PaginatedCollection } from "@/components/ui/paginated-table"
import type { Status } from "@/components/ui/status-tag"
import type { Artifact } from "@/features/artifacts/types"

export type Run = {
  id: string
  experimentId: string
  inputFileId: string
  inputFormat: string
  status: Status
  startedAt: string | null
  endedAt: string | null
  createdAt: string
  updatedAt: string
}

export type RunListItem = Run & {
  experimentName: string
  experimentSource: string
}

export type RunListResponse = PaginatedCollection<RunListItem>

export type RunExperiment = {
  id: string
  name: string
  source: string
}

export type RunVariant = {
  id: string
  name: string
  type: string
  callable: string
}

export type RunMeasurement = {
  id: string
  runId: string
  variantId: string
  outputFileId: string | null
  outputFormat: string
  status: Status
  error: string | null
  startedAt: string
  endedAt: string | null
}

export type RunDetailState = {
  run: Run | null
  experiment: RunExperiment | null
  measurements: RunMeasurement[]
  variants: RunVariant[]
  artifact: Artifact | null
  artifactContent: string | null
  artifactError: Error | null
  loading: boolean
  error: Error | null
}

export type RunDetailBreadcrumbOrigin = "runs" | "experiment"

export type RunDetailNavigationState = {
  from: RunDetailBreadcrumbOrigin
}
