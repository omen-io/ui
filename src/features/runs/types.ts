import type { PaginatedCollection } from "@/components/ui/paginated-table"

export type Run = {
  id: string
  experimentId: string
  inputFileId: string
  inputFormat: string
  status: string
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
