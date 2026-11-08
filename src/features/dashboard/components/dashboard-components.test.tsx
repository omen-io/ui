import {fireEvent, render, screen} from "@testing-library/react"
import {describe, expect, it, vi} from "vitest"
import {ExperimentRiskCard} from "./experiment-risk-card"
import {SourceCard} from "./source-card"
import {StatusCard} from "./status-card"

const source = {
    source: "search-worker-v2",
    runCount: 2,
    statusCounts: {
        completed: 1,
        completed_with_differences: 1,
        failed: 0,
    },
}

describe("dashboard components", () => {
    it("reports status selection changes", () => {
        const onToggle = vi.fn()

        render(
            <StatusCard
                data={[
                    {name: "completed", value: 7},
                    {name: "completed_with_differences", value: 8},
                    {name: "failed", value: 6},
                ]}
                onToggle={onToggle}
                selectedStatuses={new Set(["completed", "completed_with_differences", "failed"])}
            />,
        )

        fireEvent.click(screen.getByRole("button", {name: /completed/i}))

        expect(onToggle).toHaveBeenCalledWith("completed")
    })

    it("keeps source selection separate from carousel navigation", () => {
        const onPageChange = vi.fn()
        const onToggle = vi.fn()

        render(
            <SourceCard
                currentSourcePage={0}
                onPageChange={onPageChange}
                onPointerStart={vi.fn()}
                onToggle={onToggle}
                pointerStart={null}
                selectedSources={new Set(["search-worker-v2"])}
                sourcePageCount={2}
                sourcePageSize={1}
                sources={[source]}
            />,
        )

        fireEvent.click(screen.getByRole("button", {name: "Next source page"}))
        fireEvent.click(screen.getByRole("button", {name: /search-worker-v2/i}))

        expect(onPageChange).toHaveBeenCalledWith(1)
        expect(onToggle).toHaveBeenCalledWith("search-worker-v2")
    })

    it("supports keyboard selection for experiment rows", () => {
        const onToggle = vi.fn()

        render(
            <ExperimentRiskCard
                emptyState={false}
                onToggle={onToggle}
                rows={[
                    {
                        experimentId: "experiment-1",
                        name: "Search relevance",
                        source: "search-worker-v2",
                        totalRuns: 2,
                        incompleteCount: 1,
                        incompletePercentage: 0.5,
                        statusCounts: {
                            completed: 1,
                            completed_with_differences: 0,
                            failed: 1,
                        },
                    },
                ]}
                selectedExperiments={new Set(["experiment-1"])}
            />,
        )

        const row = screen.getByRole("button", {name: /Search relevance/i})
        fireEvent.keyDown(row, {key: "Enter"})

        expect(onToggle).toHaveBeenCalledWith("experiment-1")
    })
})
