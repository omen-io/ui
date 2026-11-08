import {EvilLineChart} from "@/components/evilcharts/charts/recharts-line-chart"
import type {ChartConfig} from "@/components/evilcharts/ui/recharts-chart"
import {Badge} from "@/components/ui/badge"
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card"
import {formatDate} from "../constants"

type FrequencyCardProps = {
    data: Array<Record<string, number | string>>
    selectedSources: Set<string>
    config: Record<string, ChartConfig[string]>
    hasSelection: boolean
    totalRunCount: number
}

export function FrequencyCard({
                                  data,
                                  selectedSources,
                                  config,
                                  hasSelection,
                                  totalRunCount,
                              }: FrequencyCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-end justify-between gap-4">
                <div>
                    <CardTitle>Run frequency</CardTitle>
                    <CardDescription>
                        Daily activity across the selected sources and experiments.
                    </CardDescription>
                </div>
                <Badge variant="outline">{totalRunCount} total runs</Badge>
            </CardHeader>
            <CardContent>
                {hasSelection ? (
                    <EvilLineChart
                        className="h-[320px] w-full"
                        config={config}
                        data={data}
                        xDataKey="date"
                    >
                        <EvilLineChart.Grid/>
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
                        <EvilLineChart.Tooltip/>
                        <EvilLineChart.Legend isClickable/>
                        <EvilLineChart.Brush
                            defaultStartIndex={Math.max(0, data.length - 30)}
                            defaultEndIndex={data.length - 1}
                        />
                        {[...selectedSources].map((source) => (
                            <EvilLineChart.Line
                                connectNulls
                                dataKey={source}
                                isClickable
                                key={source}
                                lineProps={{name: source}}
                            >
                                <EvilLineChart.ActiveDot/>
                            </EvilLineChart.Line>
                        ))}
                    </EvilLineChart>
                ) : (
                    <div
                        className="flex h-[300px] items-center justify-center border border-dashed text-sm text-muted-foreground">
                        Select at least one status and source to see run frequency.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
