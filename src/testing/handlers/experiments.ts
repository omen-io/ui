import { http, HttpResponse } from "msw"

import artifacts from "@/testing/fixtures/experiments/artifacts.json"
import comparisons from "@/testing/fixtures/experiments/comparisons.json"
import containerImages from "@/testing/fixtures/experiments/container-images.json"
import experiments from "@/testing/fixtures/experiments/experiments.json"
import measurements from "@/testing/fixtures/experiments/measurements.json"
import runs from "@/testing/fixtures/experiments/runs.json"
import variants from "@/testing/fixtures/experiments/variants.json"

const notFound = (resource: string) =>
  HttpResponse.json({ message: `${resource} not found.` }, { status: 404 })

const collection = <T>(items: T[]) => HttpResponse.json({ items })

const detail = <T extends { id: string }>(
  items: T[],
  id: string,
  resource: string,
) => {
  const item = items.find((candidate) => candidate.id === id)
  return item ? HttpResponse.json(item) : notFound(resource)
}

export const experimentHandlers = [
  http.get("/api/v1/experiments", () => collection(experiments.items)),
  http.get("/api/v1/experiments/:experimentId", ({ params }) =>
    detail(experiments.items, String(params.experimentId), "Experiment"),
  ),
  http.get("/api/v1/experiments/:experimentId/variants", ({ params }) =>
    collection(
      variants.items.filter(
        (variant) => variant.experimentId === String(params.experimentId),
      ),
    ),
  ),
  http.get("/api/v1/experiments/:experimentId/runs", ({ params }) =>
    collection(
      runs.items.filter(
        (run) => run.experimentId === String(params.experimentId),
      ),
    ),
  ),
  http.get("/api/v1/variants", () => collection(variants.items)),
  http.get("/api/v1/variants/:variantId", ({ params }) =>
    detail(variants.items, String(params.variantId), "Variant"),
  ),
  http.get("/api/v1/runs", () => collection(runs.items)),
  http.get("/api/v1/runs/:runId", ({ params }) =>
    detail(runs.items, String(params.runId), "Run"),
  ),
  http.get("/api/v1/runs/:runId/measurements", ({ params }) =>
    collection(
      measurements.items.filter(
        (measurement) => measurement.runId === String(params.runId),
      ),
    ),
  ),
  http.get("/api/v1/measurements", () => collection(measurements.items)),
  http.get("/api/v1/measurements/:measurementId", ({ params }) =>
    detail(
      measurements.items,
      String(params.measurementId),
      "Measurement",
    ),
  ),
  http.get("/api/v1/comparisons", () => collection(comparisons.items)),
  http.get("/api/v1/comparisons/:comparisonId", ({ params }) =>
    detail(comparisons.items, String(params.comparisonId), "Comparison"),
  ),
  http.get("/api/v1/artifacts", () => collection(artifacts.items)),
  http.get("/api/v1/artifacts/:artifactId", ({ params }) =>
    detail(artifacts.items, String(params.artifactId), "Artifact"),
  ),
  http.get("/api/v1/container-images", () =>
    collection(containerImages.items),
  ),
  http.get("/api/v1/container-images/:containerImageId", ({ params }) =>
    detail(
      containerImages.items,
      String(params.containerImageId),
      "Container image",
    ),
  ),
]
