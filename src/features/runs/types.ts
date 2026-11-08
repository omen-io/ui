import type { PaginatedCollection } from "@/components/ui/paginated-table"
import type { Status } from "@/components/ui/status-tag"

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
