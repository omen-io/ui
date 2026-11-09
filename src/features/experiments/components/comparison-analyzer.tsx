import { AlertCircle, GitCompare, RotateCcw } from "lucide-react"
import { Link } from "react-router"
import { ArtifactViewer } from "@/features/artifacts/components/artifact-viewer"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HttpError } from "@/lib/http-client"
import { ComparisonDiffView } from "./comparison-diff-view"
import type { ComparisonAnalyzerState } from "../types"

function AnalyzerSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-96" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-96" />
    </div>
  )
}

type ArtifactPanelProps = {
  label: string
  artifact: ComparisonAnalyzerState["controlArtifact"]
  content: string | null
  error: Error | null
  measurementId: string | null
}

function ArtifactPanel({
  label,
  artifact,
  content,
  error,
  measurementId,
}: ArtifactPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>
          {measurementId
            ? `Measurement ${measurementId}`
            : "Measurement unavailable"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {artifact ? (
          <ArtifactViewer
            artifact={artifact}
            content={content}
            error={error}
            compact
          />
        ) : (
          <Empty className="min-h-48 border">
            <EmptyMedia variant="icon">
              <AlertCircle className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>Output unavailable</EmptyTitle>
              <EmptyDescription>
                This measurement does not have a readable output artifact.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}

type ComparisonAnalyzerProps = ComparisonAnalyzerState & {
  onRetry: () => void
}

export function ComparisonAnalyzer({
  comparison,
  run,
  experiment,
  controlMeasurement,
  candidateMeasurement,
  controlVariant,
  candidateVariant,
  comparisonArtifact,
  comparisonContent,
  comparisonError,
  controlArtifact,
  controlContent,
  controlError,
  candidateArtifact,
  candidateContent,
  candidateError,
  loading,
  error,
  onRetry,
}: ComparisonAnalyzerProps) {
  if (loading && !comparison) return <AnalyzerSkeleton />

  if (error && !comparison) {
    const notFound = error instanceof HttpError && error.status === 404
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <AlertCircle className={notFound ? undefined : "text-destructive"} />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>
            {notFound ? "Comparison not found" : "Comparison unavailable"}
          </EmptyTitle>
          <EmptyDescription>
            {notFound
              ? "This comparison may have been removed or the link is incorrect."
              : "We could not load this comparison. Try again to refresh it."}
          </EmptyDescription>
        </EmptyHeader>
        {!notFound && (
          <Button onClick={onRetry} variant="outline">
            <RotateCcw />
            Try again
          </Button>
        )}
        <Button render={<Link to="/runs" />} variant="ghost">
          Back to runs
        </Button>
      </Empty>
    )
  }

  if (!comparison || !run || !experiment) return null

  const measurementId = candidateMeasurement?.id ?? null
  const measurementPath = measurementId
    ? `/experiments/${encodeURIComponent(
        experiment.id,
      )}/runs/${encodeURIComponent(run.id)}/measurements/${encodeURIComponent(
        measurementId,
      )}`
    : undefined

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/experiments" />}>
              Experiments
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              render={
                <Link
                  to={`/experiments/${encodeURIComponent(experiment.id)}`}
                />
              }
            >
              {experiment.id}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              render={
                <Link
                  to={`/runs?filter=${encodeURIComponent(
                    `experiment:${experiment.name}`,
                  )}`}
                />
              }
            >
              Runs
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              render={
                <Link
                  to={`/experiments/${encodeURIComponent(
                    experiment.id,
                  )}/runs/${encodeURIComponent(run.id)}`}
                />
              }
            >
              {run.id}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span>Measurements</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {measurementPath ? (
              <BreadcrumbLink render={<Link to={measurementPath} />}>
                {measurementId}
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>Measurement unavailable</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span>Comparisons</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{comparison.id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header>
        <p className="text-xs font-medium tracking-widest text-primary uppercase">
          Comparison analyzer
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {controlVariant?.name ?? "Control"} vs.{" "}
            {candidateVariant?.name ?? "Candidate"}
          </h1>
          <GitCompare className="size-5 text-muted-foreground" />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {experiment.name} - {comparison.id}
        </p>
      </header>

      <Tabs defaultValue="diff">
        <TabsList variant="line">
          <TabsTrigger value="diff">Diff artifact</TabsTrigger>
          <TabsTrigger value="outputs">
            Control and candidate outputs
          </TabsTrigger>
        </TabsList>
        <TabsContent className="pt-4" value="diff">
          <Card>
            <CardHeader>
              <CardTitle>Diff artifact</CardTitle>
              <CardDescription>
                The generated comparison between the control and candidate
                outputs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComparisonDiffView
                artifact={comparisonArtifact}
                content={comparisonContent}
                error={comparisonError}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent className="pt-4" value="outputs">
          <div className="grid gap-6 lg:grid-cols-2">
            <ArtifactPanel
              artifact={controlArtifact}
              content={controlContent}
              error={controlError}
              label={controlVariant?.name ?? "Control output"}
              measurementId={controlMeasurement?.id ?? null}
            />
            <ArtifactPanel
              artifact={candidateArtifact}
              content={candidateContent}
              error={candidateError}
              label={candidateVariant?.name ?? "Candidate output"}
              measurementId={candidateMeasurement?.id ?? null}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
