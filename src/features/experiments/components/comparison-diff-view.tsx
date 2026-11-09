import { DiffModeEnum, DiffParser, DiffView } from "@git-diff-view/react"
import { useTheme } from "@/components/theme-provider"
import { ArtifactViewer } from "@/features/artifacts/components/artifact-viewer"
import type { Artifact } from "@/features/artifacts/types"

type ComparisonDiffViewProps = {
  artifact: Artifact | null
  content: string | null
  error?: Error | null
  loading?: boolean
  compact?: boolean
}

const hasDiffHunk = (content: string) => /(?:^|\n)@@ /.test(content)

const withSyntheticHunk = (content: string, filename: string) => {
  const lines = content.split(/\r?\n/)
  const diffLines = lines.map((line) =>
    /^[ +-]/.test(line) ? line : ` ${line}`,
  )
  const oldLineCount = diffLines.filter((line) => !line.startsWith("+")).length
  const newLineCount = diffLines.filter((line) => !line.startsWith("-")).length
  const oldRange = oldLineCount === 0 ? "-0,0" : `-1,${oldLineCount}`
  const newRange = newLineCount === 0 ? "+0,0" : `+1,${newLineCount}`

  return [
    `--- a/${filename}`,
    `+++ b/${filename}`,
    `@@ ${oldRange} ${newRange} @@`,
    ...diffLines,
  ].join("\n")
}

const getDiffContent = (content: string, filename: string) =>
  hasDiffHunk(content) ? content : withSyntheticHunk(content, filename)

const isValidDiff = (content: string) => {
  try {
    const parsed = new DiffParser().parse(content)
    return !parsed.isBinary && parsed.hunks.length > 0
  } catch {
    return false
  }
}

export function ComparisonDiffView({
  artifact,
  content,
  error = null,
  loading = false,
  compact = false,
}: ComparisonDiffViewProps) {
  const { theme } = useTheme()
  const diffViewTheme =
    theme === "dark"
      ? "dark"
      : theme === "light"
        ? "light"
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
  const diffContent =
    artifact && typeof content === "string"
      ? getDiffContent(content, artifact.filename)
      : null

  if (
    !artifact ||
    !diffContent ||
    error ||
    !isValidDiff(diffContent)
  ) {
    return (
      <ArtifactViewer
        artifact={artifact}
        content={content}
        error={error}
        loading={loading}
        compact={compact}
      />
    )
  }

  return (
    <div
      className={
        compact
          ? "max-h-80 overflow-hidden rounded-md border"
          : "rounded-md border"
      }
      data-testid="comparison-diff-view"
    >
      <DiffView
        data={{
          oldFile: { fileName: artifact.filename },
          newFile: { fileName: artifact.filename },
          hunks: [diffContent],
        }}
        diffViewHighlight
        diffViewMode={DiffModeEnum.Unified}
        diffViewTheme={diffViewTheme}
        diffViewWrap
      />
    </div>
  )
}
