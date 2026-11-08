import {AlertCircle, RotateCcw} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card"

export function DashboardError({onRetry}: { onRetry: () => void }) {
    return (
        <main className="min-h-[calc(100vh-3rem)] bg-background p-4 text-foreground sm:p-6">
            <Card className="mx-auto max-w-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="size-4 text-destructive"/>
                        Dashboard unavailable
                    </CardTitle>
                    <CardDescription>
                        We could not load the latest run information. Try again to refresh
                        the dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={onRetry} variant="outline">
                        <RotateCcw/>
                        Try again
                    </Button>
                </CardContent>
            </Card>
        </main>
    )
}
