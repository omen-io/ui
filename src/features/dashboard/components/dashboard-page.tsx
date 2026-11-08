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
import { getDashboard } from "@/features/dashboard/api"
import type {
  Dashboard,
  DashboardRunFrequency,
  DashboardRunStatus,
} from "@/features/dashboard/types"
import { cn } from "@/lib/utils"

const STATUSES: DashboardRunStatus[] = [
  "completed",
  "completed_with_differences",
  "failed",
]

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

function getFrequencyData(
  frequency: DashboardRunFrequency[],
  selectedSources: Set<string>,
  selectedStatuses: Set<DashboardRunStatus>,
  selectedExperiments: Set<string>,
  experiments: Dashboard["experimentRisk"]
) {
  const experimentsBySource = new Map<string, Set<string>>()
  for (const experiment of experiments) {
    const sourceExperiments =
      experimentsBySource.get(experiment.source) ?? new Set<string>()
    sourceExperiments.add(experiment.experimentId)
    experimentsBySource.set(experiment.source, sourceExperiments)
  }

  const dates = [...new Set(frequency.map((item) => item.date))].sort()
  return dates.map((date) => {
    const row: Record<string, number | string> = { date }
    for (const source of selectedSources) {
      row[source] = frequency
        .filter(
          (item) =>
            item.date === date &&
            item.source === source &&
            selectedStatuses.has(item.status) &&
            (item.experimentId
              ? selectedExperiments.has(item.experimentId)
              : [...(experimentsBySource.get(item.source) ?? [])].every(
                  (experimentId) => selectedExperiments.has(experimentId)
                ))
        )
        .reduce((total, item) => total + item.count, 0)
    }
    return row
  })
}

function getSourceDistribution(
  sources: Dashboard["sourceDistribution"],
  experiments: Dashboard["experimentRisk"],
  selectedStatuses: Set<DashboardRunStatus>,
  selectedExperiments: Set<string>
) {
  const distribution = new Map<
    string,
    Dashboard["sourceDistribution"][number]
  >()

  for (const source of sources) {
    distribution.set(source.source, {
      source: source.source,
      runCount: 0,
      statusCounts: {
        completed: 0,
        completed_with_differences: 0,
        failed: 0,
      },
    })
  }

  for (const experiment of experiments) {
    if (!selectedExperiments.has(experiment.experimentId)) continue
    const current = distribution.get(experiment.source)
    if (!current) continue

    for (const status of STATUSES) {
      if (selectedStatuses.has(status)) {
        current.statusCounts[status] += experiment.statusCounts[status]
        current.runCount += experiment.statusCounts[status]
      }
    }
    distribution.set(experiment.source, current)
  }

  return [...distribution.values()]
}

function getStatusDistribution(
  experiments: Dashboard["experimentRisk"],
  selectedSources: Set<string>,
  selectedExperiments: Set<string>
) {
  return STATUSES.map((status) => ({
    status,
    count: experiments
      .filter(
        (experiment) =>
          selectedSources.has(experiment.source) &&
          selectedExperiments.has(experiment.experimentId)
      )
      .reduce(
        (total, experiment) => total + experiment.statusCounts[status],
        0
      ),
  }))
}

function getIncompleteRuns(
  statusCounts: Record<DashboardRunStatus, number>,
  selectedStatuses: Set<DashboardRunStatus>
) {
  return [...selectedStatuses]
    .filter((status) => status !== "completed")
    .reduce((total, status) => total + statusCounts[status], 0)
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
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

  const loadDashboard = () => {
    getDashboard()
      .then((response) => {
        setDashboard(response)
        setSelectedSources(
          new Set(response.sourceDistribution.map((item) => item.source))
        )
        setSelectedExperiments(
          new Set(response.experimentRisk.map((item) => item.experimentId))
        )
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
    () =>
      dashboard
        ? getFrequencyData(
            dashboard.runFrequency,
            selectedSources,
            selectedStatuses,
            selectedExperiments,
            dashboard.experimentRisk
          )
        : [],
    [dashboard, selectedSources, selectedStatuses, selectedExperiments]
  )

  const filteredStatusData = useMemo(
    () =>
      dashboard
        ? getStatusDistribution(
            dashboard.experimentRisk,
            selectedSources,
            selectedExperiments
          ).map((item) => ({
            name: item.status,
            value: item.count,
          }))
        : [],
    [dashboard, selectedSources, selectedExperiments]
  )

  const filteredSourceDistribution = useMemo(
    () =>
      dashboard
        ? getSourceDistribution(
            dashboard.sourceDistribution,
            dashboard.experimentRisk,
            selectedStatuses,
            selectedExperiments
          )
        : [],
    [dashboard, selectedExperiments, selectedStatuses]
  )
  const hasSelection =
    selectedStatuses.size > 0 &&
    selectedSources.size > 0 &&
    selectedExperiments.size > 0
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
    orderedSources.map((source, index) => [source.source, index])
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
    setSelectedStatuses(new Set(STATUSES))
    setSelectedSources(
      new Set(dashboard.sourceDistribution.map((item) => item.source))
    )
    setSelectedExperiments(
      new Set(dashboard.experimentRisk.map((item) => item.experimentId))
    )
    setSourcePage(0)
  }

  const disableAllFilters = () => {
    setSelectedStatuses(new Set())
    setSelectedSources(new Set())
    setSelectedExperiments(new Set())
    setSourcePage(0)
  }

  const toggleStatus = (status: DashboardRunStatus) => {
    setSelectedStatuses((current) => {
      const next = new Set(current)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
  }

  const toggleSource = (source: string) => {
    setSelectedSources((current) => {
      const next = new Set(current)
      if (next.has(source)) next.delete(source)
      else next.add(source)
      return next
    })
  }

  const toggleExperiment = (experimentId: string) => {
    setSelectedExperiments((current) => {
      const next = new Set(current)
      if (next.has(experimentId)) next.delete(experimentId)
      else next.add(experimentId)
      return next
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
              {dashboard.summary.totalRunCount} total runs
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
                {dashboard.experimentRisk
                  .filter((experiment) =>
                    selectedSources.has(experiment.source)
                  )
                  .map((experiment) => ({
                    ...experiment,
                    notCompletedRuns: getIncompleteRuns(
                      experiment.statusCounts,
                      selectedStatuses
                    ),
                  }))
                  .sort((a, b) => {
                    const percentageA =
                      a.totalRuns === 0 ? 0 : a.notCompletedRuns / a.totalRuns
                    const percentageB =
                      b.totalRuns === 0 ? 0 : b.notCompletedRuns / b.totalRuns
                    return (
                      percentageB - percentageA ||
                      b.notCompletedRuns - a.notCompletedRuns ||
                      a.name.localeCompare(b.name) ||
                      a.experimentId.localeCompare(b.experimentId)
                    )
                  })
                  .map((experiment) => {
                    const percentage =
                      experiment.totalRuns === 0
                        ? 0
                        : (experiment.notCompletedRuns / experiment.totalRuns) *
                          100
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
                        onClick={() =>
                          toggleExperiment(experiment.experimentId)
                        }
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
                            aria-label={`${experiment.name}: ${experiment.notCompletedRuns} of ${experiment.totalRuns} incomplete runs`}
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
                            {experiment.notCompletedRuns > 0 && (
                              <TrendingDown className="size-3 text-destructive" />
                            )}
                            {experiment.notCompletedRuns}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
            {dashboard.experimentRisk.every(
              (experiment) =>
                !selectedSources.has(experiment.source) ||
                !selectedExperiments.has(experiment.experimentId) ||
                getIncompleteRuns(experiment.statusCounts, selectedStatuses) ===
                  0
            ) && (
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
