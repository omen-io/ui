import {DashboardError} from "@/features/dashboard/components/dashboard-error"
import {DashboardHeader} from "@/features/dashboard/components/dashboard-header"
import {DashboardLoading} from "@/features/dashboard/components/dashboard-loading"
import {ExperimentRiskCard} from "@/features/dashboard/components/experiment-risk-card"
import {FrequencyCard} from "@/features/dashboard/components/frequency-card"
import {SourceCard} from "@/features/dashboard/components/source-card"
import {StatusCard} from "@/features/dashboard/components/status-card"
import {useDashboard} from "@/features/dashboard/hooks/use-dashboard"

export default function DashboardRoute() {
    const dashboard = useDashboard()

    if (dashboard.loading) return <DashboardLoading/>
    if (dashboard.error || !dashboard.dashboard) {
        return <DashboardError onRetry={dashboard.retry}/>
    }

    const {dashboard: response} = dashboard

    return (
        <main className="min-h-[calc(100vh-3rem)] bg-background p-4 text-foreground sm:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <DashboardHeader
                    onDisableAll={dashboard.disableAllFilters}
                    onEnableAll={dashboard.enableAllFilters}
                />
                <section className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                    <StatusCard
                        data={dashboard.statusData}
                        onToggle={dashboard.toggleStatus}
                        selectedStatuses={dashboard.selectedStatuses}
                    />
                    <SourceCard
                        currentSourcePage={dashboard.currentSourcePage}
                        onPageChange={dashboard.goToSourcePage}
                        onPointerStart={dashboard.setSourcePointerStart}
                        onToggle={dashboard.toggleSource}
                        pointerStart={dashboard.sourcePointerStart}
                        selectedSources={dashboard.selectedSources}
                        sourcePageCount={dashboard.sourcePageCount}
                        sourcePageSize={dashboard.sourcePageSize}
                        sources={dashboard.orderedSources}
                    />
                </section>
                <FrequencyCard
                    config={dashboard.lineChartConfig}
                    data={dashboard.frequencyData}
                    hasSelection={response.metadata.hasSelection}
                    selectedSources={dashboard.selectedSources}
                    totalRunCount={response.metadata.summary.totalRunCount}
                />
                <ExperimentRiskCard
                    emptyState={response.data.experimentChart.emptyState}
                    onToggle={dashboard.toggleExperiment}
                    rows={response.data.experimentChart.rows}
                    selectedExperiments={dashboard.selectedExperiments}
                />
            </div>
        </main>
    )
}
