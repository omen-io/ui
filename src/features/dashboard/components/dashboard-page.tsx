import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleOff,
  RotateCcw,
  TrendingDown,
} from "lucide-react"
import { EvilLineChart } from "@/components/evilcharts/charts/recharts-line-chart"

import { EvilPieChart } from "@/components/evilcharts/charts/recharts-pie-chart"
import { type ChartConfig } from "@/components/evilcharts/ui/recharts-chart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
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
  initialDashboardRequest,
  postDashboard,
} from "@/features/dashboard/api"
import type {
  DashboardFilterState,
  DashboardResponse,
  DashboardRunStatus,
} from "@/features/dashboard/types"
import { DASHBOARD_STATUSES as STATUSES } from "@/features/dashboard/types"
import { cn } from "@/lib/utils"

const STATUS_LABELS: Record<DashboardRunStatus, string> = {
  completed: "Completed",
  completed_with_differences: "With differences",
  failed: "Failed",
}

const STATUS_COLORS: Record<DashboardRunStatus, string> = {
  completed: "var(--color-chart-2)",
  completed_with_differences: "var(--color-chart-4)",
  failed: "var(--color-destructive)",
}

const chartConfig = {
  completed: { label: "Completed", colors: { light: ["var(--chart-2)"] } },
  completed_with_differences: {
    label: "With differences",
    colors: { light: ["var(--chart-4)"] },
  },
  failed: { label: "Failed", colors: { light: ["var(--destructive)"] } },
} satisfies ChartConfig

const LINE_PALETTE = [
  "#0f766e",
  "#2563eb",
  "#c2410c",
  "#7c3aed",
  "#be123c",
  "#15803d",
  "#a16207",
  "#0369a1",
]

function formatStatus(status: DashboardRunStatus) {
  return STATUS_LABELS[status]
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}

function DashboardLoading() {
  return (
    <main className="min-h-[calc(100vh-3rem)] bg-background p-4 text-foreground sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <Skeleton className="h-16 w-72" />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-96" />
        <Skeleton className="h-72" />
      </div>
    </main>
  )
}

function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="min-h-[calc(100vh-3rem)] bg-background p-4 text-foreground sm:p-6">
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="size-4 text-destructive" />
            Dashboard unavailable
          </CardTitle>
          <CardDescription>
            We could not load the latest run information. Try again to refresh
            the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRetry} variant="outline">
            <RotateCcw />
            Try again
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedStatuses, setSelectedStatuses] = useState<
    Set<DashboardRunStatus>
  >(new Set(STATUSES))
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set())
  const [selectedExperiments, setSelectedExperiments] = useState<Set<string>>(
    new Set()
  )
  const [sourcePage, setSourcePage] = useState(0)
  const [sourcePageSize, setSourcePageSize] = useState(4)
  const [sourcePointerStart, setSourcePointerStart] = useState<number | null>(
    null
  )

  const loadDashboard = (request = initialDashboardRequest()) => {
    postDashboard(request)
      .then((response) => {
        setDashboard(response)
        setSelectedStatuses(new Set(response.metadata.filters.statuses))
        setSelectedSources(new Set(response.metadata.filters.sources))
        setSelectedExperiments(new Set(response.metadata.filters.experiments))
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    void loadDashboard()
  }, [])

  useEffect(() => {
    const updatePageSize = () =>
      setSourcePageSize(window.innerWidth < 640 ? 2 : 4)
    updatePageSize()
    window.addEventListener("resize", updatePageSize)
    return () => window.removeEventListener("resize", updatePageSize)
  }, [])

  const retryDashboard = () => {
    setLoading(true)
    setError(false)
    void loadDashboard()
  }

  const frequencyData = useMemo(
    () => dashboard?.data.runChart ?? [],
    [dashboard]
  )

  const filteredStatusData = useMemo(
    () =>
      dashboard
        ? dashboard.data.pieChart.map((item) => ({
            name: item.status,
            value: item.count,
          }))
        : [],
    [dashboard]
  )

  const filteredSourceDistribution = useMemo(
    () => (dashboard ? dashboard.data.sourceChart : []),
    [dashboard]
  )
  const hasSelection = dashboard?.metadata.hasSelection ?? false
  const orderedSources = useMemo(
    () =>
      filteredSourceDistribution
        ? [...filteredSourceDistribution].sort(
            (a, b) => b.runCount - a.runCount
          )
        : [],
    [filteredSourceDistribution]
  )
  const sourcePageCount = Math.max(
    1,
    Math.ceil(orderedSources.length / sourcePageSize)
  )
  const currentSourcePage = Math.min(sourcePage, sourcePageCount - 1)
  const sourceColorIndex = new Map(
    (dashboard?.metadata.availableFilters.sources ?? []).map(
      (source, index) => [source, index]
    )
  )
  const lineChartConfig = Object.fromEntries(
    [...selectedSources].map((source) => [
      source,
      {
        label: source,
        colors: {
          light: [
            LINE_PALETTE[
              (sourceColorIndex.get(source) ?? 0) % LINE_PALETTE.length
            ],
          ],
        },
      },
    ])
  ) as Record<string, ChartConfig[string]>
  const enableAllFilters = () => {
    if (!dashboard) return
    const filters = {
      statuses: [...dashboard.metadata.availableFilters.statuses],
      sources: dashboard.metadata.availableFilters.sources,
      experiments: dashboard.metadata.availableFilters.experiments.map(
        (experiment) => experiment.experimentId
      ),
    }
    setSelectedStatuses(new Set(filters.statuses))
    setSelectedSources(new Set(filters.sources))
    setSelectedExperiments(new Set(filters.experiments))
    void postDashboard({
      filters,
      ordering: dashboard.metadata.ordering,
    }).then(setDashboard)
    setSourcePage(0)
  }

  const disableAllFilters = () => {
    setSelectedStatuses(new Set())
    setSelectedSources(new Set())
    setSelectedExperiments(new Set())
    setSourcePage(0)
    if (dashboard) {
      void postDashboard({
        filters: { statuses: [], sources: [], experiments: [] },
        ordering: dashboard.metadata.ordering,
      }).then(setDashboard)
    }
  }

  const refreshWithFilters = (filters: DashboardFilterState) => {
    setSelectedStatuses(new Set(filters.statuses))
    setSelectedSources(new Set(filters.sources))
    setSelectedExperiments(new Set(filters.experiments))
    if (dashboard) {
      void postDashboard({
        filters,
        ordering: dashboard.metadata.ordering,
      }).then(setDashboard)
    }
  }

  const toggleStatus = (status: DashboardRunStatus) => {
    const statuses = new Set(selectedStatuses)
    if (statuses.has(status)) statuses.delete(status)
    else statuses.add(status)
    refreshWithFilters({
      statuses: [...statuses],
      sources: [...selectedSources],
      experiments: [...selectedExperiments],
    })
  }

  const toggleSource = (source: string) => {
    const sources = new Set(selectedSources)
    if (sources.has(source)) sources.delete(source)
    else sources.add(source)
    refreshWithFilters({
      statuses: [...selectedStatuses],
      sources: [...sources],
      experiments: [...selectedExperiments],
    })
  }

  const toggleExperiment = (experimentId: string) => {
    const experiments = new Set(selectedExperiments)
    if (experiments.has(experimentId)) experiments.delete(experimentId)
    else experiments.add(experimentId)
    refreshWithFilters({
      statuses: [...selectedStatuses],
      sources: [...selectedSources],
      experiments: [...experiments],
    })
  }

  const goToSourcePage = (page: number) => {
    setSourcePage(Math.min(Math.max(page, 0), sourcePageCount - 1))
  }

  if (loading) return <DashboardLoading />
  if (error || !dashboard) return <DashboardError onRetry={retryDashboard} />

  return (
    <main className="min-h-[calc(100vh-3rem)] bg-background p-4 text-foreground sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium tracking-widest text-primary uppercase">
              Operations overview
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Run health
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              See where your experiments need attention and how activity is
              trending.
            </p>
          </div>
          <div className="inline-flex">
            <Button
              onClick={enableAllFilters}
              variant="outline"
              size="sm"
              className="border-r-0"
            >
              <RotateCcw />
              Enable all
            </Button>
            <Button
              onClick={disableAllFilters}
              variant="outline"
              size="sm"
              className="border-l-border"
            >
              Disable all
              <CircleOff />
            </Button>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Runs by status</CardTitle>
              <CardDescription>
                Select a status to filter every view below.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-[minmax(180px,0.9fr)_1fr]">
              <EvilPieChart
                data={filteredStatusData}
                config={chartConfig}
                dataKey="value"
                nameKey="name"
                className="h-52"
              >
                <EvilPieChart.Pie
                  innerRadius="62"
                  outerRadius="84"
                  cornerRadius={4}
                  paddingAngle={4}
                  isClickable
                  disabledSectors={STATUSES.filter(
                    (status) => !selectedStatuses.has(status)
                  )}
                  onSectorClick={(status) =>
                    toggleStatus(status as DashboardRunStatus)
                  }
                />
                <EvilPieChart.Tooltip />
              </EvilPieChart>
              <div className="flex flex-col justify-center gap-2">
                {STATUSES.map((status) => {
                  const statusData = filteredStatusData.find(
                    (item) => item.name === status
                  )
                  const selected = selectedStatuses.has(status)
                  return (
                    <button
                      aria-pressed={selected}
                      className={cn(
                        "flex items-center justify-between border px-3 py-2 text-left transition-colors hover:bg-muted",
                        !selected && "opacity-45"
                      )}
                      key={status}
                      onClick={() => toggleStatus(status)}
                      type="button"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: STATUS_COLORS[status] }}
                        />
                        <span>{formatStatus(status)}</span>
                      </span>
                      <span className="flex items-center gap-2 font-medium tabular-nums">
                        {statusData?.value ?? 0}
                        {selected && <Check className="size-3 text-primary" />}
                      </span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Runs by source</CardTitle>
              <CardDescription>
                Choose one or more sources to focus the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div
                className="flex w-full min-w-0 touch-pan-y gap-4 transition-transform duration-300 ease-out"
                onPointerDown={(event) => setSourcePointerStart(event.clientX)}
                onPointerUp={(event) => {
                  if (sourcePointerStart === null) return
                  const delta = event.clientX - sourcePointerStart
                  if (Math.abs(delta) > 40) {
                    goToSourcePage(currentSourcePage + (delta < 0 ? 1 : -1))
                  }
                  setSourcePointerStart(null)
                }}
                style={{
                  transform: `translateX(calc(-${currentSourcePage * 100}% - ${currentSourcePage}rem))`,
                }}
              >
                {Array.from({ length: sourcePageCount }, (_, page) => (
                  <div
                    className="grid w-full min-w-0 shrink-0 basis-full grid-cols-2 grid-rows-2"
                    key={page}
                  >
                    {orderedSources
                      .slice(page * sourcePageSize, (page + 1) * sourcePageSize)
                      .map((source) => {
                        const selected = selectedSources.has(source.source)
                        return (
                          <button
                            aria-pressed={selected}
                            className={cn(
                              "min-w-0 border p-3 text-left transition-colors hover:bg-muted",
                              selected && "border-primary/50 bg-primary/5",
                              !selected && "opacity-45"
                            )}
                            key={source.source}
                            onClick={() => toggleSource(source.source)}
                            type="button"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="truncate text-xs font-medium">
                                {source.source}
                              </span>
                              {selected && (
                                <Check className="size-3 shrink-0 text-primary" />
                              )}
                            </div>
                            <div className="mt-3 text-xl font-semibold tabular-nums">
                              {source.runCount}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {STATUSES.map((status) => (
                                <Badge
                                  key={status}
                                  variant={
                                    status === "failed"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  {source.statusCounts[status]}{" "}
                                  {status === "completed"
                                    ? "ok"
                                    : status === "failed"
                                      ? "failed"
                                      : "diff"}
                                </Badge>
                              ))}
                            </div>
                          </button>
                        )
                      })}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Button
                  aria-label="Previous source page"
                  disabled={currentSourcePage === 0}
                  onClick={() => goToSourcePage(currentSourcePage - 1)}
                  size="icon"
                  variant="outline"
                >
                  <ChevronLeft />
                </Button>
                <span
                  className="text-xs text-muted-foreground"
                  aria-live="polite"
                >
                  Page {currentSourcePage + 1} of {sourcePageCount}
                </span>
                <Button
                  aria-label="Next source page"
                  disabled={currentSourcePage === sourcePageCount - 1}
                  onClick={() => goToSourcePage(currentSourcePage + 1)}
                  size="icon"
                  variant="outline"
                >
                  <ChevronRight />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Run frequency over time</CardTitle>
              <CardDescription>
                Daily runs across selected sources and statuses.
              </CardDescription>
            </div>
            <Badge variant="outline">
              {dashboard.metadata.summary.totalRunCount} total runs
            </Badge>
          </CardHeader>
          <CardContent>
            {hasSelection ? (
              <EvilLineChart
                className="h-[320px] w-full"
                config={lineChartConfig}
                data={frequencyData}
                xDataKey="date"
              >
                <EvilLineChart.Grid />
                <EvilLineChart.XAxis
                  axisLine={false}
                  dataKey="date"
                  tickFormatter={formatDate}
                  tickLine={false}
                  tickMargin={8}
                />
                <EvilLineChart.YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />
                <EvilLineChart.Tooltip />
                <EvilLineChart.Legend isClickable />
                <EvilLineChart.Brush
                  defaultStartIndex={Math.max(0, frequencyData.length - 30)}
                  defaultEndIndex={frequencyData.length - 1}
                />
                {[...selectedSources].map((source) => (
                  <EvilLineChart.Line
                    connectNulls
                    dataKey={source}
                    isClickable
                    key={source}
                    lineProps={{ name: source }}
                  >
                    <EvilLineChart.ActiveDot />
                  </EvilLineChart.Line>
                ))}
              </EvilLineChart>
            ) : (
              <div className="flex h-[300px] items-center justify-center border border-dashed text-sm text-muted-foreground">
                Select at least one status and source to see run frequency.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Experiments needing attention</CardTitle>
            <CardDescription>
              Ranked by incomplete runs, so the most concerning experiments stay
              visible first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Experiment</TableHead>
                  <TableHead className="hidden sm:table-cell">Source</TableHead>
                  <TableHead className="w-[45%]">Incomplete runs</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.data.experimentChart.rows.map((experiment) => {
                  const percentage = experiment.incompletePercentage * 100
                  return (
                    <TableRow
                      aria-pressed={selectedExperiments.has(
                        experiment.experimentId
                      )}
                      className={cn(
                        "cursor-pointer focus-visible:bg-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
                        !selectedExperiments.has(experiment.experimentId) &&
                          "opacity-45"
                      )}
                      key={experiment.experimentId}
                      onClick={() => toggleExperiment(experiment.experimentId)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault()
                          toggleExperiment(experiment.experimentId)
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <TableCell>
                        <div className="font-medium">{experiment.name}</div>
                        <div className="mt-1 text-muted-foreground sm:hidden">
                          {experiment.source}
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">
                        {experiment.source}
                      </TableCell>
                      <TableCell>
                        <Progress
                          aria-label={`${experiment.name}: ${experiment.incompleteCount} of ${experiment.totalRuns} incomplete runs`}
                          className="[&_[data-slot=progress-indicator]]:bg-destructive"
                          value={percentage}
                        />
                        <span className="mt-1 block text-[11px] text-muted-foreground">
                          {Math.round(percentage)}% of {experiment.totalRuns}{" "}
                          runs
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          {experiment.incompleteCount > 0 && (
                            <TrendingDown className="size-3 text-destructive" />
                          )}
                          {experiment.incompleteCount}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {dashboard.data.experimentChart.emptyState && (
              <div className="border border-dashed p-6 text-center text-sm text-muted-foreground">
                No incomplete runs match the selected filters.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
