import { AlertCircle, Link2, Play, RotateCcw } from "lucide-react"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
          <TableHead className="w-12 text-right">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((run) => (
          <TableRow key={run.id}>
            <TableCell className="font-medium">{run.experimentName}</TableCell>
            <TableCell className="font-mono text-[11px] text-muted-foreground">
              {run.id}
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
            <TableCell className="text-right">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Link
                      aria-label={`Open run ${run.id}`}
                      className="inline-flex size-7 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                      state={{ from: "runs" }}
                      to={`/experiments/${encodeURIComponent(run.experimentId)}/runs/${encodeURIComponent(run.id)}`}
                    />
                  }
                >
                  <Link2 aria-hidden="true" />
                </TooltipTrigger>
                <TooltipContent>Open run details</TooltipContent>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
        <PaginatedTableSpacerRows
          columnCount={7}
          itemCount={items.length}
          pageSize={pageSize}
        />
      </TableBody>
    </Table>
  )
}
