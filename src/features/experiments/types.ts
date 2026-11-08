import type { Status } from "@/components/ui/status-tag"

export type Collection<T> = {
  items: T[]
}

export type PaginatedCollection<T> = Collection<T> & {
  metadata: {
    total: number
    limit: number
    offset: number
  }
}

export type Experiment = {
  id: string
  name: string
  source: string
  createdAt: string
  updatedAt: string | null
}

export type ExperimentListItem = Experiment & {
  runCount: number
}

export type Variant = {
  id: string
  experimentId: string
  containerImageId: string | null
  containerImage?: ContainerImage | null
  type: string
  key: string
  callable: string
  name: string
}

export type Run = {
  id: string
  experimentId: string
  inputFileId: string
  inputFormat: string
  status: Status
  startedAt: string | null
  endedAt: string | null
  createdAt: string
  updatedAt: string
}

export type Measurement = {
  id: string
  runId: string
  variantId: string
  outputFileId: string | null
  outputFormat: string
  status: Status
  error: string | null
  startedAt: string
  endedAt: string | null
  createdAt: string
  updatedAt: string
  retryOf?: string
}

export type Comparison = {
  id: string
  runId: string
  controlMeasurementId: string
  candidateMeasurementId: string
  outputFileId: string | null
  outputFormat: string
  createdAt: string
  updatedAt: string
}

export type Artifact = {
  id: string
  bucket: string
  objectKey: string
  filename: string
  contentType: string
  createdAt: string
}

export type ContainerImage = {
  id: string
  registry: string
  repository: string
  digest: string
  tag: string | null
  createdAt: string
  updatedAt: string | null
}

export type ArtifactDownload = {
  url: string
  expiresAt: string
}
