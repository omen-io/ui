import {EChartsPieChart, type ChartConfig} from "@/components/evilcharts/charts/echarts-pie-chart"

const chartData = [
    {name: "Desktop", value: 420},
    {name: "Mobile", value: 280},
    {name: "Tablet", value: 120},
    {name: "Other", value: 60},
]

const chartConfig = {
    Desktop: {
        label: "Desktop",
        colors: {light: ["var(--color-chart-1)"]},
    },
    Mobile: {
        label: "Mobile",
        colors: {light: ["var(--color-chart-2)"]},
    },
    Tablet: {
        label: "Tablet",
        colors: {light: ["var(--color-chart-3)"]},
    },
    Other: {
        label: "Other",
        colors: {light: ["var(--color-chart-4)"]},
    },
} satisfies ChartConfig

export function App() {
    return (
        <main className="min-h-svh bg-background p-6 text-foreground">
            <div className="mx-auto max-w-2xl space-y-2">
                <h1 className="text-2xl font-semibold">Traffic sources</h1>
                <p className="text-sm text-muted-foreground">
                    A basic pie chart using EvilCharts and shadcn theme tokens.
                </p>

                <EChartsPieChart
                    data={chartData}
                    config={chartConfig}
                    dataKey="value"
                    nameKey="name"
                    className="h-[420px] w-full"
                >
                    <EChartsPieChart.Pie
                        innerRadius="0%"
                        outerRadius="75%"
                        paddingAngle={2}
                        isClickable
                    >
                        <EChartsPieChart.Label position="outside"/>
                    </EChartsPieChart.Pie>
                    <EChartsPieChart.Tooltip/>
                    <EChartsPieChart.Legend isClickable/>
                </EChartsPieChart>
            </div>

            <div className="font-mono text-xs text-muted-foreground">
                (Press <kbd>d</kbd> to toggle dark mode)
            </div>
        </main>
    )
}

export default App
