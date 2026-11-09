import { AlertCircle, FileText, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "@/components/ui/code-block"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { useHighlightedCode } from "@/hooks/use-highlighted-code"
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

const languageByExtension: Record<string, string> = {
  css: "css",
  diff: "diff",
  htm: "html",
  html: "html",
  js: "javascript",
  json: "json",
  md: "markdown",
  py: "python",
  sh: "bash",
  sql: "sql",
  ts: "typescript",
  tsx: "tsx",
  xml: "html",
  yaml: "yaml",
  yml: "yaml",
}

const getLanguage = (artifact: Artifact | null) => {
  if (!artifact) return "text"

  const extension = artifact.filename.split(".").pop()?.toLowerCase()
  if (extension && extension in languageByExtension) {
    return languageByExtension[extension]
  }

  if (artifact.contentType.includes("json")) return "json"
  if (artifact.contentType.includes("javascript")) return "javascript"
  if (artifact.contentType.includes("yaml")) return "yaml"
  if (artifact.contentType.includes("xml")) return "html"
  if (artifact.contentType.includes("diff")) return "diff"

  return "text"
}

export function ArtifactViewer({
  artifact,
  content,
  loading = false,
  error = null,
  onRetry,
  compact = false,
}: ArtifactViewerProps) {
  const previewContent = typeof content === "string" ? content : ""
  const highlightedLines = useHighlightedCode(
    previewContent,
    getLanguage(artifact)
  )

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
    <CodeBlock size={compact ? "sm" : "default"}>
      <CodeBlockHeader>
        <FileText className="size-3.5" />
        <CodeBlockTitle>{artifact.filename}</CodeBlockTitle>
        <span className="ml-auto shrink-0 text-xs">{artifact.contentType}</span>
        <CodeBlockActions>
          <CodeBlockCopyButton value={content} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent className="h-[20lh] overflow-hidden" wrap>
        {highlightedLines.map((line, index) => (
          <CodeBlockLine key={index}>{line}</CodeBlockLine>
        ))}
      </CodeBlockContent>
    </CodeBlock>
  )
}
