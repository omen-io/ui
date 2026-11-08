import { AlertCircle, RotateCcw, TestTubes } from "lucide-react"
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
import type { ExperimentListItem } from "../types"

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))

type ExperimentsTableProps = {
  items: ExperimentListItem[] | undefined
  loading: boolean
  error: boolean
  hasResponse: boolean
  pageSize: number
  onRetry: () => void
}

export function ExperimentsTable({
  items,
  loading,
  error,
  hasResponse,
  pageSize,
  onRetry,
}: ExperimentsTableProps) {
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
          <EmptyTitle>Experiments unavailable</EmptyTitle>
          <EmptyDescription>
            We could not load the experiment catalog. Try again to refresh it.
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
          <TestTubes />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No experiments found</EmptyTitle>
          <EmptyDescription>
            Try changing the filter to find another experiment.
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
          <TableHead className="hidden md:table-cell">ID</TableHead>
          <TableHead>Source</TableHead>
          <TableHead className="text-right">Runs</TableHead>
          <TableHead className="text-right">Last activity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((experiment) => (
          <TableRow key={experiment.id}>
            <TableCell className="font-medium">
              <Link
                className="underline-offset-4 hover:underline"
                to={`/experiments/${encodeURIComponent(experiment.id)}`}
              >
                {experiment.name}
              </Link>
            </TableCell>
            <TableCell className="hidden font-mono text-[11px] text-muted-foreground md:table-cell">
              {experiment.id}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {experiment.source}
            </TableCell>
            <TableCell className="text-right font-semibold tabular-nums">
              {experiment.runCount}
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {formatDate(experiment.updatedAt ?? experiment.createdAt)}
            </TableCell>
          </TableRow>
        ))}
        <PaginatedTableSpacerRows
          columnCount={5}
          itemCount={items.length}
          pageSize={pageSize}
        />
      </TableBody>
    </Table>
  )
}
