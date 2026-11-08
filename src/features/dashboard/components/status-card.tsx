import {Check} from "lucide-react"
import {EvilPieChart} from "@/components/evilcharts/charts/recharts-pie-chart"
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card"
import {cn} from "@/lib/utils"
import {formatStatus, STATUS_CHART_CONFIG, STATUS_COLORS} from "../constants"
import type {DashboardRunStatus} from "../types"
import {DASHBOARD_STATUSES as STATUSES} from "../types"

type StatusCardProps = {
    data: Array<{ name: DashboardRunStatus; value: number }>
    selectedStatuses: Set<DashboardRunStatus>
    onToggle: (status: DashboardRunStatus) => void
}

export function StatusCard({
                               data,
                               selectedStatuses,
                               onToggle,
                           }: StatusCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Runs by status</CardTitle>
                <CardDescription>
                    Select a status to filter every view below.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-[minmax(180px,0.9fr)_1fr]">
                <EvilPieChart
                    data={data}
                    config={STATUS_CHART_CONFIG}
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
                        onSectorClick={(status) => onToggle(status as DashboardRunStatus)}
                    />
                    <EvilPieChart.Tooltip/>
                </EvilPieChart>
                <div className="flex flex-col justify-center gap-2">
                    {STATUSES.map((status) => {
                        const statusData = data.find((item) => item.name === status)
                        const selected = selectedStatuses.has(status)
                        return (
                            <button
                                aria-pressed={selected}
                                className={cn(
                                    "flex items-center justify-between border px-3 py-2 text-left transition-colors hover:bg-muted",
                                    !selected && "opacity-45"
                                )}
                                key={status}
                                onClick={() => onToggle(status)}
                                type="button"
                            >
                <span className="flex items-center gap-2">
                  <span
                      className="size-2 rounded-full"
                      style={{backgroundColor: STATUS_COLORS[status]}}
                  />
                  <span>{formatStatus(status)}</span>
                </span>
                                <span className="flex items-center gap-2 font-medium tabular-nums">
                  {statusData?.value ?? 0}
                                    {selected && <Check className="size-3 text-primary"/>}
                </span>
                            </button>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
