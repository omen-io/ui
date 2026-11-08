import type { ChartConfig } from "@/components/evilcharts/ui/recharts-chart"
import { STATUS_TAGS } from "@/components/ui/status-tag"
import type { DashboardRunStatus } from "./types"

export const STATUS_LABELS: Record<DashboardRunStatus, string> = {
  completed: "Completed",
  completed_with_differences: "Differences",
  in_progress: "Pending",
  failed: "Failed",
}

export const STATUS_COLORS: Record<DashboardRunStatus, string> = {
  completed: STATUS_TAGS.completed.color,
  completed_with_differences: STATUS_TAGS.completed_with_differences.color,
  in_progress: STATUS_TAGS.in_progress.color,
  failed: STATUS_TAGS.failed.color,
}

export const STATUS_CHART_CONFIG = {
  completed: {
    label: STATUS_LABELS.completed,
    colors: { light: [STATUS_COLORS.completed] },
  },
  completed_with_differences: {
    label: STATUS_LABELS.completed_with_differences,
    colors: { light: [STATUS_COLORS.completed_with_differences] },
  },
  in_progress: {
    label: STATUS_LABELS.in_progress,
    colors: { light: [STATUS_COLORS.in_progress] },
  },
  failed: {
    label: STATUS_LABELS.failed,
    colors: { light: [STATUS_COLORS.failed] },
  },
} satisfies ChartConfig

export const LINE_PALETTE = [
  "#0f766e",
  "#2563eb",
  "#c2410c",
  "#7c3aed",
  "#be123c",
  "#15803d",
  "#a16207",
  "#0369a1",
]

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}
