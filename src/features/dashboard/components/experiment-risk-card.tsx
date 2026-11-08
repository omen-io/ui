import {TrendingDown} from "lucide-react"
import {Progress} from "@/components/ui/progress"
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {cn} from "@/lib/utils"
import type {DashboardExperimentChartRow} from "../types"

type ExperimentRiskCardProps = {
    rows: DashboardExperimentChartRow[]
    emptyState: boolean
    selectedExperiments: Set<string>
    onToggle: (experimentId: string) => void
}

export function ExperimentRiskCard({
                                       rows,
                                       emptyState,
                                       selectedExperiments,
                                       onToggle,
                                   }: ExperimentRiskCardProps) {
    return (
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
                        {rows.map((experiment) => {
                            const percentage = experiment.incompletePercentage * 100
                            const selected = selectedExperiments.has(experiment.experimentId)
                            return (
                                <TableRow
                                    aria-pressed={selected}
                                    className={cn(
                                        "cursor-pointer focus-visible:bg-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
                                        !selected && "opacity-45"
                                    )}
                                    key={experiment.experimentId}
                                    onClick={() => onToggle(experiment.experimentId)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault()
                                            onToggle(experiment.experimentId)
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
                      {Math.round(percentage)}% of {experiment.totalRuns} runs
                    </span>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold tabular-nums">
                    <span className="inline-flex items-center gap-1">
                      {experiment.incompleteCount > 0 && (
                          <TrendingDown className="size-3 text-destructive"/>
                      )}
                        {experiment.incompleteCount}
                    </span>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
                {emptyState && (
                    <div className="border border-dashed p-6 text-center text-sm text-muted-foreground">
                        No incomplete runs match the selected filters.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
