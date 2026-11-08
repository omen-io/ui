import type {ChartConfig} from "@/components/evilcharts/ui/recharts-chart"
import type {DashboardRunStatus} from "./types"

export const STATUS_LABELS: Record<DashboardRunStatus, string> = {
    completed: "Completed",
    completed_with_differences: "With differences",
    failed: "Failed",
}

export const STATUS_COLORS: Record<DashboardRunStatus, string> = {
    completed: "var(--color-chart-2)",
    completed_with_differences: "var(--color-chart-4)",
    failed: "var(--color-destructive)",
}

export const STATUS_CHART_CONFIG = {
    completed: {label: "Completed", colors: {light: ["var(--chart-2)"]}},
    completed_with_differences: {
        label: "With differences",
        colors: {light: ["var(--chart-4)"]},
    },
    failed: {label: "Failed", colors: {light: ["var(--destructive)"]}},
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

export function formatStatus(status: DashboardRunStatus) {
    return STATUS_LABELS[status]
}

export function formatDate(value: string) {
    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
    }).format(new Date(`${value}T00:00:00`))
}
