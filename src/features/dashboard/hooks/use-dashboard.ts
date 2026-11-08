import {useEffect, useMemo, useState} from "react"
import {initialDashboardRequest, postDashboard,} from "@/features/dashboard/api"
import type {DashboardFilterState, DashboardResponse, DashboardRunStatus,} from "@/features/dashboard/types"
import {DASHBOARD_STATUSES as STATUSES} from "@/features/dashboard/types"
import {LINE_PALETTE} from "../constants"

export function useDashboard() {
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

    const retry = () => {
        setLoading(true)
        setError(false)
        void loadDashboard()
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

    const frequencyData = useMemo(() => dashboard?.data.runChart ?? [], [dashboard])
    const statusData = useMemo(
        () =>
            dashboard?.data.pieChart.map((item) => ({
                name: item.status,
                value: item.count,
            })) ?? [],
        [dashboard]
    )
    const orderedSources = useMemo(
        () =>
            [...(dashboard?.data.sourceChart ?? [])].sort(
                (a, b) => b.runCount - a.runCount
            ),
        [dashboard]
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
    )

    const goToSourcePage = (page: number) => {
        setSourcePage(Math.min(Math.max(page, 0), sourcePageCount - 1))
    }

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
                filters: {statuses: [], sources: [], experiments: []},
                ordering: dashboard.metadata.ordering,
            }).then(setDashboard)
        }
    }

    return {
        dashboard,
        loading,
        error,
        retry,
        selectedStatuses,
        selectedSources,
        selectedExperiments,
        statusData,
        frequencyData,
        orderedSources,
        sourcePageSize,
        sourcePageCount,
        currentSourcePage,
        lineChartConfig,
        sourcePointerStart,
        setSourcePointerStart,
        goToSourcePage,
        toggleStatus,
        toggleSource,
        toggleExperiment,
        enableAllFilters,
        disableAllFilters,
    }
}
