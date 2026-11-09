import { useParams } from "react-router"
import { ComparisonAnalyzer } from "@/features/experiments/components/comparison-analyzer"
import { useComparisonAnalyzer } from "@/features/experiments/hooks/use-comparison-analyzer"

export default function ComparisonAnalyzerPage() {
  const { comparisonId = "" } = useParams()
  const analyzer = useComparisonAnalyzer(comparisonId)

  return (
    <main className="min-h-[calc(100vh-3rem)] bg-background p-4 text-foreground sm:p-6">
      <div className="mx-auto max-w-7xl">
        <ComparisonAnalyzer {...analyzer} onRetry={analyzer.retry} />
      </div>
    </main>
  )
}
