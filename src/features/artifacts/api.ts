import { request } from "@/lib/http-client"
import type { Artifact } from "./types"

export const getArtifact = (artifactId: string, signal?: AbortSignal) =>
  request<Artifact>(`/api/v1/artifacts/${encodeURIComponent(artifactId)}`, {
    signal,
  })

export const getArtifactDownloadUrl = (
  artifactId: string,
  signal?: AbortSignal,
) =>
  request<{ url: string; expiresAt: string }>(
    `/api/v1/artifacts/${encodeURIComponent(artifactId)}/presigned-url`,
    { signal },
  )

export const fetchArtifactContent = (url: string, signal?: AbortSignal) =>
  request<string>(url, { responseType: "text", signal })
