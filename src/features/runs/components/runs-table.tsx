import { AlertCircle, RotateCcw, Play } from "lucide-react"
import { StatusTag } from "@/components/ui/status-tag"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { PaginatedTableSpacerRows } from "@/components/ui/paginated-table"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { RunListItem } from "../types"

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—"

type RunsTableProps = {
  items: RunListItem[] | undefined
  loading: boolean
  error: boolean
  hasResponse: boolean
  pageSize: number
  onRetry: () => void
}

export function RunsTable({
  items,
  loading,
  error,
  hasResponse,
  pageSize,
  onRetry,
}: RunsTableProps) {
  if (loading && !hasResponse) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton className="h-10 w-full" key={index} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <AlertCircle className="text-destructive" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Runs unavailable</EmptyTitle>
          <EmptyDescription>
            We could not load the run catalog. Try again to refresh it.
          </EmptyDescription>
        </EmptyHeader>
        <Button onClick={onRetry} variant="outline">
          <RotateCcw />
          Try again
        </Button>
      </Empty>
    )
  }

  if (!items || items.length === 0) {
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <Play />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No runs found</EmptyTitle>
          <EmptyDescription>
            Try changing the filter to find another run.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Experiment</TableHead>
          <TableHead>Run ID</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Started at</TableHead>
          <TableHead>Ended at</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((run) => (
          <TableRow key={run.id}>
            <TableCell className="font-medium">
              <Link
                className="hover:underline"
                to={`/experiments/${run.experimentId}/runs/${run.id}`}
                state={{ from: "runs" }}
              >
                {run.experimentName}
              </Link>
            </TableCell>
            <TableCell className="font-mono text-[11px] text-muted-foreground">
              <Link
                className="hover:text-primary hover:underline"
                to={`/experiments/${run.experimentId}/runs/${run.id}`}
                state={{ from: "runs" }}
              >
                {run.id}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {run.experimentSource}
            </TableCell>
            <TableCell>
              <StatusTag status={run.status} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(run.startedAt)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(run.endedAt)}
            </TableCell>
          </TableRow>
        ))}
        <PaginatedTableSpacerRows
          columnCount={6}
          itemCount={items.length}
          pageSize={pageSize}
        />
      </TableBody>
    </Table>
  )
}
