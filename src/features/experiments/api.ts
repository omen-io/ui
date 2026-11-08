import { request } from "@/lib/http-client"
import type {
  Artifact,
  ArtifactDownload,
  Comparison,
  ContainerImage,
  Experiment,
  ExperimentListItem,
  Measurement,
  PaginatedCollection,
  Run,
  Variant,
} from "./types"

const paths = {
  experiments: "/api/v1/experiments",
  variants: "/api/v1/variants",
  runs: "/api/v1/runs",
  measurements: "/api/v1/measurements",
  comparisons: "/api/v1/comparisons",
  artifacts: "/api/v1/artifacts",
  containerImages: "/api/v1/container-images",
} as const

export type ExperimentOrderBy = "date" | "name" | "runCount"
export type OrderDirection = "asc" | "desc"

export type ListExperimentsOptions = {
  filter?: string
  orderBy?: ExperimentOrderBy
  orderDirection?: OrderDirection
  limit?: number
  offset?: number
  signal?: AbortSignal
}

export const listExperiments = ({
  filter = "",
  orderBy = "date",
  orderDirection = "desc",
  limit = 10,
  offset = 0,
  signal,
}: ListExperimentsOptions = {}) => {
  const params = new URLSearchParams({
    filter,
    orderBy,
    orderDirection,
    limit: String(limit),
    offset: String(offset),
  })
  return request<PaginatedCollection<ExperimentListItem>>(
    `${paths.experiments}?${params.toString()}`,
    { signal },
  )
}

export const getExperiment = (experimentId: string) =>
  request<Experiment>(
    `${paths.experiments}/${encodeURIComponent(experimentId)}`,
  )

export const listVariants = (experimentId?: string) =>
  request<{ items: Variant[] }>(
    experimentId
      ? `${paths.experiments}/${encodeURIComponent(experimentId)}/variants`
      : paths.variants,
  )

export const getVariant = (variantId: string) =>
  request<Variant>(`${paths.variants}/${encodeURIComponent(variantId)}`)

export const listRuns = (experimentId?: string) =>
  request<{ items: Run[] }>(
    experimentId
      ? `${paths.experiments}/${encodeURIComponent(experimentId)}/runs`
      : paths.runs,
  )

export const getRun = (runId: string) =>
  request<Run>(`${paths.runs}/${encodeURIComponent(runId)}`)

export const listMeasurements = (runId?: string) =>
  request<{ items: Measurement[] }>(
    runId
      ? `${paths.runs}/${encodeURIComponent(runId)}/measurements`
      : paths.measurements,
  )

export const getMeasurement = (measurementId: string) =>
  request<Measurement>(
    `${paths.measurements}/${encodeURIComponent(measurementId)}`,
  )

export const listComparisons = () =>
  request<{ items: Comparison[] }>(paths.comparisons)

export const getComparison = (comparisonId: string) =>
  request<Comparison>(
    `${paths.comparisons}/${encodeURIComponent(comparisonId)}`,
  )

export const listArtifacts = () =>
  request<{ items: Artifact[] }>(paths.artifacts)

export const getArtifact = (artifactId: string) =>
  request<Artifact>(`${paths.artifacts}/${encodeURIComponent(artifactId)}`)

export const listContainerImages = () =>
  request<{ items: ContainerImage[] }>(paths.containerImages)

export const getContainerImage = (containerImageId: string) =>
  request<ContainerImage>(
    `${paths.containerImages}/${encodeURIComponent(containerImageId)}`,
  )

export function getArtifactDownloadUrl(
  artifactId: string,
): Promise<ArtifactDownload> {
  return request<ArtifactDownload>(
    `/api/v1/artifacts/${encodeURIComponent(artifactId)}/presigned-url`,
  )
}
