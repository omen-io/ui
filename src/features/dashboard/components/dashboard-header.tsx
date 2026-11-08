import {CircleOff, RotateCcw} from "lucide-react"
import {Button} from "@/components/ui/button"

type DashboardHeaderProps = {
    onEnableAll: () => void
    onDisableAll: () => void
}

export function DashboardHeader({
                                    onEnableAll,
                                    onDisableAll,
                                }: DashboardHeaderProps) {
    return (
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
                <p className="text-xs font-medium tracking-widest text-primary uppercase">
                    Operations overview
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                    Run health
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    See where your experiments need attention and how activity is
                    trending.
                </p>
            </div>
            <div className="inline-flex">
                <Button
                    onClick={onEnableAll}
                    variant="outline"
                    size="sm"
                    className="border-r-0"
                >
                    <RotateCcw/>
                    Enable all
                </Button>
                <Button
                    onClick={onDisableAll}
                    variant="outline"
                    size="sm"
                    className="border-l-border"
                >
                    Disable all
                    <CircleOff/>
                </Button>
            </div>
        </header>
    )
}
