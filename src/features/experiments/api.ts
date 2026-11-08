import { request } from "@/lib/http-client"
import type {
  Artifact,
  ArtifactDownload,
  Collection,
  Comparison,
  ContainerImage,
  Experiment,
  Measurement,
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

export const listExperiments = () =>
  request<Collection<Experiment>>(paths.experiments)

export const getExperiment = (experimentId: string) =>
  request<Experiment>(
    `${paths.experiments}/${encodeURIComponent(experimentId)}`,
  )

export const listVariants = (experimentId?: string) =>
  request<Collection<Variant>>(
    experimentId
      ? `${paths.experiments}/${encodeURIComponent(experimentId)}/variants`
      : paths.variants,
  )

export const getVariant = (variantId: string) =>
  request<Variant>(`${paths.variants}/${encodeURIComponent(variantId)}`)

export const listRuns = (experimentId?: string) =>
  request<Collection<Run>>(
    experimentId
      ? `${paths.experiments}/${encodeURIComponent(experimentId)}/runs`
      : paths.runs,
  )

export const getRun = (runId: string) =>
  request<Run>(`${paths.runs}/${encodeURIComponent(runId)}`)

export const listMeasurements = (runId?: string) =>
  request<Collection<Measurement>>(
    runId
      ? `${paths.runs}/${encodeURIComponent(runId)}/measurements`
      : paths.measurements,
  )

export const getMeasurement = (measurementId: string) =>
  request<Measurement>(
    `${paths.measurements}/${encodeURIComponent(measurementId)}`,
  )

export const listComparisons = () =>
  request<Collection<Comparison>>(paths.comparisons)

export const getComparison = (comparisonId: string) =>
  request<Comparison>(
    `${paths.comparisons}/${encodeURIComponent(comparisonId)}`,
  )

export const listArtifacts = () =>
  request<Collection<Artifact>>(paths.artifacts)

export const getArtifact = (artifactId: string) =>
  request<Artifact>(`${paths.artifacts}/${encodeURIComponent(artifactId)}`)

export const listContainerImages = () =>
  request<Collection<ContainerImage>>(paths.containerImages)

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
