import {Check, ChevronLeft, ChevronRight} from "lucide-react"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card"
import {cn} from "@/lib/utils"
import type {DashboardSourceSummary} from "../types"
import {DASHBOARD_STATUSES as STATUSES} from "../types"

type SourceCardProps = {
    sources: DashboardSourceSummary[]
    selectedSources: Set<string>
    sourcePageSize: number
    sourcePageCount: number
    currentSourcePage: number
    pointerStart: number | null
    onPointerStart: (value: number | null) => void
    onPageChange: (page: number) => void
    onToggle: (source: string) => void
}

export function SourceCard({
                               sources,
                               selectedSources,
                               sourcePageSize,
                               sourcePageCount,
                               currentSourcePage,
                               pointerStart,
                               onPointerStart,
                               onPageChange,
                               onToggle,
                           }: SourceCardProps) {
    return (
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
                    onPointerDown={(event) => onPointerStart(event.clientX)}
                    onPointerUp={(event) => {
                        if (pointerStart === null) return
                        const delta = event.clientX - pointerStart
                        if (Math.abs(delta) > 40) {
                            onPageChange(currentSourcePage + (delta < 0 ? 1 : -1))
                        }
                        onPointerStart(null)
                    }}
                    style={{
                        transform: `translateX(calc(-${currentSourcePage * 100}% - ${currentSourcePage}rem))`,
                    }}
                >
                    {Array.from({length: sourcePageCount}, (_, page) => (
                        <div
                            className="grid w-full min-w-0 shrink-0 basis-full grid-cols-2 grid-rows-2"
                            key={page}
                        >
                            {sources
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
                                            onClick={() => onToggle(source.source)}
                                            type="button"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                        <span className="truncate text-xs font-medium">
                          {source.source}
                        </span>
                                                {selected && (
                                                    <Check className="size-3 shrink-0 text-primary"/>
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
                                                            status === "failed" ? "destructive" : "secondary"
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
                        onClick={() => onPageChange(currentSourcePage - 1)}
                        size="icon"
                        variant="outline"
                    >
                        <ChevronLeft/>
                    </Button>
                    <span className="text-xs text-muted-foreground" aria-live="polite">
            Page {currentSourcePage + 1} of {sourcePageCount}
          </span>
                    <Button
                        aria-label="Next source page"
                        disabled={currentSourcePage === sourcePageCount - 1}
                        onClick={() => onPageChange(currentSourcePage + 1)}
                        size="icon"
                        variant="outline"
                    >
                        <ChevronRight/>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
