import { AlertCircle, FileText, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import type { Artifact } from "../types"

type ArtifactViewerProps = {
  artifact: Artifact | null
  content: string | null
  loading?: boolean
  error?: Error | null
  onRetry?: () => void
  compact?: boolean
}

const isPreviewable = (contentType: string) =>
  contentType.startsWith("text/") ||
  contentType.includes("json") ||
  contentType.includes("xml") ||
  contentType.includes("yaml") ||
  contentType.includes("javascript")

export function ArtifactViewer({
  artifact,
  content,
  loading = false,
  error = null,
  onRetry,
  compact = false,
}: ArtifactViewerProps) {
  if (loading) {
    return <Skeleton className={compact ? "h-48 w-full" : "h-[32rem] w-full"} />
  }

  if (
    error ||
    !artifact ||
    content === null ||
    typeof content !== "string" ||
    !isPreviewable(artifact.contentType)
  ) {
    return (
      <Empty className={compact ? "min-h-48" : "min-h-[32rem]"}>
        <EmptyMedia variant="icon">
          <AlertCircle className="text-destructive" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Preview unavailable</EmptyTitle>
          <EmptyDescription>
            This artifact could not be loaded as readable text. You can still
            open the complete artifact.
          </EmptyDescription>
        </EmptyHeader>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RotateCcw />
            Try again
          </Button>
        )}
      </Empty>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-md border bg-muted/20">
      <div className="flex items-center gap-2 border-b px-3 py-2 text-xs text-muted-foreground">
        <FileText className="size-3.5" />
        <span className="truncate">{artifact.filename}</span>
        <span className="ml-auto shrink-0">{artifact.contentType}</span>
      </div>
      <pre
        className={`max-h-[32rem] overflow-auto p-4 font-mono text-xs leading-5 whitespace-pre-wrap ${
          compact ? "max-h-48" : ""
        }`}
      >
        {content}
      </pre>
    </div>
  )
}
