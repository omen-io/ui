import { useCallback, useEffect, useState } from "react"
import { Link, useLocation, useParams } from "react-router"
import {
  fetchArtifactContent,
  getArtifact,
  getArtifactDownloadUrl,
} from "@/features/artifacts/api"
import { ArtifactViewer } from "@/features/artifacts/components/artifact-viewer"
import type { Artifact } from "@/features/artifacts/types"
import { Button } from "@/components/ui/button"

export default function ArtifactDetailPage() {
  const { artifactId = "" } = useParams()
  const location = useLocation()
  const [artifact, setArtifact] = useState<Artifact | null>(null)
  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    const controller = new AbortController()
    Promise.all([
      getArtifact(artifactId, controller.signal),
      getArtifactDownloadUrl(artifactId, controller.signal),
    ])
      .then(async ([nextArtifact, download]) => {
        setArtifact(nextArtifact)
        setContent(await fetchArtifactContent(download.url, controller.signal))
        setLoading(false)
      })
      .catch((nextError: unknown) => {
        if (controller.signal.aborted) return
        setLoading(false)
        setError(
          nextError instanceof Error
            ? nextError
            : new Error("Artifact unavailable."),
        )
      })
    return () => controller.abort()
  }, [artifactId])

  useEffect(() => load(), [load])

  const retry = () => {
      setLoading(true)
      setError(null)
      load()
  }

  const backTo = (location.state as { from?: string } | null)?.from ?? "/runs"

  return (
    <main className="min-h-[calc(100vh-3rem)] bg-background p-4 text-foreground sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Artifact viewer</p>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              {artifact?.filename ?? "Complete artifact"}
            </h1>
          </div>
          <Button nativeButton={false} render={<Link to={backTo} />} variant="outline">
            Back
          </Button>
        </div>
        <ArtifactViewer
          artifact={artifact}
          content={content}
          error={error}
          loading={loading}
          onRetry={retry}
        />
      </div>
    </main>
  )
}
