import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  FlaskConical,
  GitBranch,
  Link2,
  Play,
  RotateCcw,
  XCircle,
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HttpError } from "@/lib/http-client"
import type { Experiment, Run, Variant } from "../types"

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—"

const titleCase = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())

const imageReference = (variant: Variant) => {
  const image = variant.containerImage
  if (!image) return null
  return `${image.registry}/${image.repository}${
    image.tag ? `:${image.tag}` : `@${image.digest}`
  }`
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton className="h-24" key={index} />
        ))}
      </div>
      <Skeleton className="h-72" />
    </div>
  )
}

type ExperimentDetailProps = {
  experiment: Experiment | null
  runs: Run[]
  variants: Variant[]
  loading: boolean
  error: Error | null
  onRetry: () => void
}

export function ExperimentDetail({
  experiment,
  runs,
  variants,
  loading,
  error,
  onRetry,
}: ExperimentDetailProps) {
  const [copied, setCopied] = useState(false)

  if (loading && !experiment) return <DetailSkeleton />

  if (error && !experiment) {
    const notFound = error instanceof HttpError && error.status === 404
    return (
      <Empty>
        <EmptyMedia variant="icon">
          {notFound ? (
            <FlaskConical />
          ) : (
            <AlertCircle className="text-destructive" />
          )}
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>
            {notFound ? "Experiment not found" : "Experiment unavailable"}
          </EmptyTitle>
          <EmptyDescription>
            {notFound
              ? "This experiment may have been removed or the link is incorrect."
              : "We could not load this experiment. Try again to refresh it."}
          </EmptyDescription>
        </EmptyHeader>
        {!notFound && (
          <Button onClick={onRetry} variant="outline">
            <RotateCcw />
            Try again
          </Button>
        )}
        <Button render={<Link to="/experiments" />} variant="ghost">
          Back to experiments
        </Button>
      </Empty>
    )
  }

  if (!experiment) return null

  const completedRuns = runs.filter((run) => run.status === "completed").length
  const pendingRuns = runs.filter((run) => run.status === "in_progress").length
  const differenceRuns = runs.filter(
    (run) => run.status === "completed_with_differences"
  ).length
  const failedRuns = runs.filter((run) => run.status === "failed").length
  const recentRuns = runs.slice(0, 5)
  const copyId = async () => {
    await navigator.clipboard.writeText(experiment.id)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/experiments" />}>
              Experiments
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{experiment.id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium tracking-widest text-primary uppercase">
            Experiment detail
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {experiment.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {experiment.source} - {experiment.id}
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
          { label: "Total runs", value: runs.length, icon: Play },
          { label: "Completed", value: completedRuns, icon: CheckCircle2 },
          { label: "Pending", value: pendingRuns, icon: Clock3 },
          { label: "Differences", value: differenceRuns, icon: AlertCircle },
          { label: "Failed", value: failedRuns, icon: XCircle },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} size="sm">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {value}
                </p>
              </div>
              <Icon className="size-5 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Recent runs</CardTitle>
            <CardDescription>
              Up to five of the latest executions for this experiment.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Started
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Ended</TableHead>
                  <TableHead className="w-12 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRuns.map((run) => (
                  <TableRow className="h-10" key={run.id}>
                    <TableCell className="font-mono text-[11px]">
                      {run.id.slice(0, 8)}…
                    </TableCell>
                    <TableCell>
                      <StatusTag status={run.status} />
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {formatDate(run.startedAt)}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {formatDate(run.endedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Link
                              aria-label={`Open run ${run.id}`}
                              className="inline-flex size-7 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                              state={{ from: "experiment" }}
                              to={`/experiments/${encodeURIComponent(experiment.id)}/runs/${encodeURIComponent(run.id)}`}
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
                {Array.from(
                  { length: Math.max(0, 5 - recentRuns.length) },
                  (_, index) => (
                    <TableRow
                      aria-hidden={recentRuns.length > 0 || index > 0}
                      className="h-10"
                      key={`empty-${index}`}
                    >
                      <TableCell
                        className="text-sm text-muted-foreground"
                        colSpan={5}
                      >
                        {recentRuns.length === 0 && index === 0
                          ? "No runs have been recorded yet."
                          : null}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </CardContent>
          <div className="border-t px-4 py-3">
            <Link
              className="text-xs font-medium text-primary hover:underline"
              to={`/runs?filter=${encodeURIComponent(`experiment:${experiment.name}`)}`}
            >
              {runs.length > 5 ? `See all ${runs.length} runs` : "See all runs"}{" "}
              →
            </Link>
          </div>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Experiment properties</CardTitle>
            <CardDescription>
              Identity and lifecycle information.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex h-full flex-col gap-4">
            {[
              { label: "Source", value: experiment.source, icon: GitBranch },
              {
                label: "Created",
                value: formatDate(experiment.createdAt),
                icon: CalendarDays,
              },
              {
                label: "Last updated",
                value: formatDate(experiment.updatedAt),
                icon: Clock3,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div className="flex gap-3" key={label}>
                <Icon className="mt-0.5 size-4 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-muted-foreground">{label}</p>
                  <p className="truncate font-medium">{value}</p>
                </div>
              </div>
            ))}
            <div className="mt-auto border-t pt-4">
              <p className="text-muted-foreground">Experiment ID</p>
              <p className="mt-1 font-mono text-[11px] break-all">
                {experiment.id}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured variants</CardTitle>
          <CardDescription>
            {variants.length} variant{variants.length === 1 ? "" : "s"}{" "}
            available for this experiment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {variants.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No variants are configured yet.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {variants.map((variant) => (
                <div className="border border-border/70 p-4" key={variant.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{variant.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {variant.key}
                      </p>
                    </div>
                    <Badge
                      variant={
                        variant.type === "control" ? "secondary" : "outline"
                      }
                    >
                      {titleCase(variant.type)}
                    </Badge>
                  </div>
                  <dl className="mt-4 grid gap-2 text-xs">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Callable</dt>
                      <dd className="truncate font-mono">{variant.callable}</dd>
                    </div>
                    <div className="border-t pt-2">
                      <dt className="text-muted-foreground">Container image</dt>
                      {variant.containerImage ? (
                        <>
                          <dd className="mt-1 font-mono break-all">
                            {imageReference(variant)}
                          </dd>
                          <Accordion className="mt-1">
                            <AccordionItem value={`image-${variant.id}`}>
                              <AccordionTrigger>Image details</AccordionTrigger>
                              <AccordionContent>
                                <dl className="grid gap-1 text-[11px] text-muted-foreground">
                                  <div className="flex justify-between gap-4">
                                    <dt>Registry</dt>
                                    <dd className="truncate font-mono">
                                      {variant.containerImage.registry}
                                    </dd>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <dt>Repository</dt>
                                    <dd className="truncate font-mono">
                                      {variant.containerImage.repository}
                                    </dd>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <dt>Tag</dt>
                                    <dd className="truncate font-mono">
                                      {variant.containerImage.tag ?? "—"}
                                    </dd>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <dt>Digest</dt>
                                    <dd className="max-w-[14rem] truncate font-mono">
                                      {variant.containerImage.digest}
                                    </dd>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <dt>Created</dt>
                                    <dd>
                                      {formatDate(
                                        variant.containerImage.createdAt
                                      )}
                                    </dd>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <dt>Updated</dt>
                                    <dd>
                                      {formatDate(
                                        variant.containerImage.updatedAt
                                      )}
                                    </dd>
                                  </div>
                                </dl>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </>
                      ) : (
                        <dd className="mt-1 text-muted-foreground">
                          Not configured
                        </dd>
                      )}
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
