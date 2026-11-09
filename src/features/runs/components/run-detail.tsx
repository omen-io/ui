import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Copy,
  FileInput,
  RotateCcw,
} from "lucide-react"
import { Link } from "react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusTag } from "@/components/ui/status-tag"
import { ArtifactViewer } from "@/features/artifacts/components/artifact-viewer"
import { HttpError } from "@/lib/http-client"
import { RunDetailBreadcrumb } from "./run-detail-breadcrumb"
import type { RunDetailBreadcrumbOrigin, RunDetailState } from "../types"

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—"

const formatDuration = (startedAt: string | null, endedAt: string | null) => {
  if (!startedAt) return "—"
  const end = endedAt ? Date.parse(endedAt) : Date.now()
  const duration = Math.max(0, end - Date.parse(startedAt))
  const seconds = Math.floor(duration / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${seconds % 60}s`
}

const titleCase = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-72" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton className="h-24" key={index} />
        ))}
      </div>
      <Skeleton className="h-72" />
    </div>
  )
}

type RunDetailProps = RunDetailState & {
  breadcrumbOrigin?: RunDetailBreadcrumbOrigin
  onRetry: () => void
}

export function RunDetail({
  run,
  experiment,
  measurements,
  variants,
  artifact,
  artifactContent,
  artifactError,
  breadcrumbOrigin,
  loading,
  error,
  onRetry,
}: RunDetailProps) {
  const [copied, setCopied] = useState(false)

  if (loading && !run) return <DetailSkeleton />

  if (error && !run) {
    const notFound = error instanceof HttpError && error.status === 404
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <AlertCircle className={notFound ? undefined : "text-destructive"} />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>
            {notFound ? "Run not found" : "Run unavailable"}
          </EmptyTitle>
          <EmptyDescription>
            {notFound
              ? "This run may have been removed or the link is incorrect."
              : "We could not load this run. Try again to refresh it."}
          </EmptyDescription>
        </EmptyHeader>
        {!notFound && (
          <Button onClick={onRetry} variant="outline">
            <RotateCcw />
            Try again
          </Button>
        )}
        <Button render={<Link to="/runs" />} variant="ghost">
          Back to runs
        </Button>
      </Empty>
    )
  }

  if (!run || !experiment) return null

  const variantById = new Map(variants.map((variant) => [variant.id, variant]))
  const copyId = async () => {
    await navigator.clipboard.writeText(run.id)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-6">
      <RunDetailBreadcrumb
        experimentId={experiment.id}
        experimentName={experiment.name}
        origin={breadcrumbOrigin}
        runId={run.id}
      />

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium tracking-widest text-primary uppercase">
            Run detail
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Run details
            </h1>
            <StatusTag status={run.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {experiment.source} - {run.id}
          </p>
        </div>
        <Button
          onClick={() => {
            void copyId()
          }}
          variant="outline"
        >
          <Copy />
          {copied ? "Copied" : "Copy ID"}
        </Button>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Started",
            value: formatDate(run.startedAt),
            icon: CalendarDays,
          },
          {
            label: "Ended",
            value: formatDate(run.endedAt),
            icon: CalendarDays,
          },
          {
            label: "Duration",
            value: formatDuration(run.startedAt, run.endedAt),
            icon: Clock3,
          },
          {
            label: "Input format",
            value: run.inputFormat.toUpperCase(),
            icon: FileInput,
          },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <Icon className="size-4 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="truncate text-sm font-medium">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Input file</CardTitle>
            <CardDescription>
              The input processed by this run, with metadata and a quick
              preview.
            </CardDescription>
          </div>
          {artifact && (
            <Button
              nativeButton={false}
              render={
                <Link
                  to={`/artifacts/${encodeURIComponent(artifact.id)}`}
                  state={{ from: `/experiments/${experiment.id}/runs/${run.id}` }}
                />
              }
              variant="outline"
            >
              Open input file
              <ArrowUpRight />
            </Button>
          )}
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[minmax(14rem,0.8fr)_minmax(0,1.8fr)]">
          <div className="space-y-4 text-sm">
            {artifact ? (
              <>
                <div>
                  <p className="text-muted-foreground">Filename</p>
                  <p className="mt-1 break-all font-medium">{artifact.filename}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Content type</p>
                  <p className="mt-1 font-mono text-xs">{artifact.contentType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="mt-1 font-medium">
                    {formatDate(artifact.createdAt)}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                Input file metadata unavailable.
              </p>
            )}
          </div>
          <ArtifactViewer
            artifact={artifact}
            content={artifactContent}
            error={artifactError}
            compact
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Measurements</CardTitle>
          <CardDescription>
            {measurements.length} measurement
            {measurements.length === 1 ? "" : "s"} recorded for this run.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {measurements.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No measurements have been recorded yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Callable</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Ended</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {measurements.map((measurement) => {
                  const variant = variantById.get(measurement.variantId)
                  return (
                    <TableRow key={measurement.id}>
                      <TableCell>
                        <div className="font-medium">
                          {variant?.name ?? "Unknown variant"}
                        </div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                          {measurement.id}
                        </div>
                      </TableCell>
                      <TableCell>
                        {variant ? (
                          <Badge variant="outline">{titleCase(variant.type)}</Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="max-w-56 truncate font-mono text-xs">
                        {variant?.callable ?? "—"}
                      </TableCell>
                      <TableCell>
                        <StatusTag status={measurement.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(measurement.startedAt)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(measurement.endedAt)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
