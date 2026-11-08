import {Skeleton} from "@/components/ui/skeleton"

export function DashboardLoading() {
    return (
        <main className="min-h-[calc(100vh-3rem)] bg-background p-4 text-foreground sm:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <Skeleton className="h-16 w-72"/>
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                    <Skeleton className="h-80"/>
                    <Skeleton className="h-80"/>
                </div>
                <Skeleton className="h-96"/>
                <Skeleton className="h-72"/>
            </div>
        </main>
    )
}
