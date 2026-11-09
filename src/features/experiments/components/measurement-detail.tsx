import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  FileOutput,
  GitCompare,
  RotateCcw,
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"
import { ArtifactViewer } from "@/features/artifacts/components/artifact-viewer"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
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
import { Skeleton } from "@/components/ui/skeleton"
import { StatusTag } from "@/components/ui/status-tag"
import { HttpError } from "@/lib/http-client"
import { ComparisonDiffView } from "./comparison-diff-view"
import type {
  MeasurementDetailBreadcrumbOrigin,
  MeasurementDetailState,
} from "../types"

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—"

const formatDuration = (startedAt: string, endedAt: string | null) => {
  const end = endedAt ? Date.parse(endedAt) : Date.now()
  const seconds = Math.max(0, Math.floor((end - Date.parse(startedAt)) / 1000))
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-80" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-96" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton className="h-24" key={index} />
        ))}
      </div>
      <Skeleton className="h-72" />
    </div>
  )
}

type MeasurementBreadcrumbProps = {
  experimentId: string
  experimentName: string
  runId: string
  measurementId: string
  origin?: MeasurementDetailBreadcrumbOrigin
}

function MeasurementBreadcrumb({
  experimentId,
  experimentName,
  runId,
  measurementId,
  origin = "experiment",
}: MeasurementBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {origin === "runs" ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/runs" />}>Runs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                render={
                  <Link
                    to={`/experiments/${encodeURIComponent(
                      experimentId,
                    )}/runs/${encodeURIComponent(runId)}`}
                  />
                }
              >
                {runId}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        ) : (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/experiments" />}>
                Experiments
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                render={
                  <Link to={`/experiments/${encodeURIComponent(experimentId)}`} />
                }
              >
                {experimentId}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                render={
                  <Link
                    to={`/runs?filter=${encodeURIComponent(
                      `experiment:${experimentName}`,
                    )}`}
                  />
                }
              >
                Runs
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                render={
                  <Link
                    to={`/experiments/${encodeURIComponent(
                      experimentId,
                    )}/runs/${encodeURIComponent(runId)}`}
                  />
                }
              >
                {runId}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <span>Measurements</span>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{measurementId}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

type MeasurementDetailProps = MeasurementDetailState & {
  breadcrumbOrigin?: MeasurementDetailBreadcrumbOrigin
  onRetry: () => void
}

export function MeasurementDetail({
  measurement,
  run,
  experiment,
  variant,
  controlVariant,
  outputArtifact,
  outputContent,
  outputError,
  comparison,
  comparisonArtifact,
  comparisonContent,
  comparisonError,
  breadcrumbOrigin,
  loading,
  error,
  onRetry,
}: MeasurementDetailProps) {
  const [copied, setCopied] = useState(false)

  if (loading && !measurement) return <DetailSkeleton />

  if (error && !measurement) {
    const notFound = error instanceof HttpError && error.status === 404
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <AlertCircle className={notFound ? undefined : "text-destructive"} />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>
            {notFound ? "Measurement not found" : "Measurement unavailable"}
          </EmptyTitle>
          <EmptyDescription>
            {notFound
              ? "This measurement may have been removed or the link is incorrect."
              : "We could not load this measurement. Try again to refresh it."}
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

  if (!measurement || !run || !experiment) return null

  const copyId = async () => {
    await navigator.clipboard.writeText(measurement.id)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }
  const isFailed = measurement.status === "failed"
  const comparisonPath = comparison
    ? `/comparisons/${encodeURIComponent(comparison.id)}`
    : undefined

  return (
    <div className="space-y-6">
      <MeasurementBreadcrumb
        experimentId={experiment.id}
        experimentName={experiment.name}
        measurementId={measurement.id}
        origin={breadcrumbOrigin}
        runId={run.id}
      />

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium tracking-widest text-primary uppercase">
            Measurement detail
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {variant?.name ?? "Measurement"}
            </h1>
            <StatusTag status={measurement.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {experiment.name} - {measurement.id}
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Variant", value: variant?.name ?? "Unknown", icon: GitCompare },
          {
            label: "Callable",
            value: variant?.callable ?? "—",
            icon: GitCompare,
          },
          {
            label: "Started",
            value: formatDate(measurement.startedAt),
            icon: CalendarDays,
          },
          {
            label: "Ended",
            value: formatDate(measurement.endedAt),
            icon: CalendarDays,
          },
          {
            label: "Duration",
            value: formatDuration(measurement.startedAt, measurement.endedAt),
            icon: Clock3,
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
            <CardTitle>{isFailed ? "Measurement error" : "Output preview"}</CardTitle>
          <CardDescription>
            {isFailed
              ? "The variant did not produce a usable output for this measurement."
              : "A readable preview of the output produced by this variant."}
          </CardDescription>
          </div>
          {outputArtifact && (
            <Button
              nativeButton={false}
              render={
                <Link
                  state={{
                    from: `/experiments/${encodeURIComponent(
                      experiment.id,
                    )}/runs/${encodeURIComponent(run.id)}/measurements/${encodeURIComponent(
                      measurement.id,
                    )}`,
                  }}
                  to={`/artifacts/${encodeURIComponent(outputArtifact.id)}`}
                />
              }
              variant="outline"
            >
              Open output file
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isFailed ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                <p className="whitespace-pre-wrap text-destructive">
                  {measurement.error ?? "The measurement failed without an error message."}
                </p>
              </div>
            </div>
          ) : outputArtifact ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(14rem,0.8fr)_minmax(0,1.8fr)]">
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Filename</p>
                  <p className="mt-1 break-all font-medium">
                    {outputArtifact.filename}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Content type</p>
                  <p className="mt-1 font-mono text-xs">
                    {outputArtifact.contentType}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="mt-1 font-medium">
                    {formatDate(outputArtifact.createdAt)}
                  </p>
                </div>
              </div>
              <ArtifactViewer
                artifact={outputArtifact}
                content={outputContent}
                error={outputError}
                compact
              />
            </div>
          ) : (
            <Empty className="min-h-48 border">
              <EmptyMedia variant="icon">
                <FileOutput />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>Output preview unavailable</EmptyTitle>
                <EmptyDescription>
                  This measurement has not produced a readable output artifact yet.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>

      {variant?.type === "candidate" && (
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Comparison with control</CardTitle>
              <CardDescription>
                Preview how this candidate differs from the control variant.
              </CardDescription>
            </div>
            <Button
              disabled={!comparisonPath}
              nativeButton={false}
              render={<Link to={comparisonPath ?? "#"} />}
              variant="outline"
            >
              Open full comparison
              <GitCompare />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {comparison ? (
              <>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Control:</span>
                  <span className="font-medium">
                    {controlVariant?.name ?? "Unknown variant"}
                  </span>
                  <span className="text-muted-foreground">vs.</span>
                  <span className="font-medium">{variant.name}</span>
                </div>
                {comparisonArtifact ? (
                  <ComparisonDiffView
                    artifact={comparisonArtifact}
                    content={comparisonContent}
                    error={comparisonError}
                    compact
                  />
                ) : (
                  <Empty className="min-h-48 border">
                    <EmptyMedia variant="icon">
                      <GitCompare />
                    </EmptyMedia>
                    <EmptyHeader>
                      <EmptyTitle>Comparison preview unavailable</EmptyTitle>
                      <EmptyDescription>
                        The comparison exists, but its preview artifact is not
                        available.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </>
            ) : (
              <Empty className="min-h-48 border">
                <EmptyMedia variant="icon">
                  <CheckCircle2 />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>Comparison not available yet</EmptyTitle>
                  <EmptyDescription>
                    A control comparison will appear when both measurements
                    complete successfully.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
