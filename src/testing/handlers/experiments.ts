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

const experimentOrderFields = new Set(["date", "name", "runCount"])
const runOrderFields = new Set(["startedAt", "endedAt", "experimentName"])
const orderDirections = new Set(["asc", "desc"])

const parseFilter = (value: string) =>
  value
    .match(/(?:[^\s"]+|"[^"]*")+/g)
    ?.map((token) => {
      const separator = token.indexOf(":")
      const field = separator === -1 ? "all" : token.slice(0, separator)
      const term = (separator === -1 ? token : token.slice(separator + 1))
        .replace(/^"|"$/g, "")
        .toLowerCase()
      return { field, term }
    })
    .filter(({ term }) => term.length > 0) ?? []

const listExperiments = (request: Request) => {
  const url = new URL(request.url)
  const filter = url.searchParams.get("filter") ?? ""
  const orderBy = url.searchParams.get("orderBy") ?? "date"
  const orderDirection = url.searchParams.get("orderDirection") ?? "desc"
  const limit = Number(url.searchParams.get("limit") ?? "10")
  const offset = Number(url.searchParams.get("offset") ?? "0")

  if (
    !experimentOrderFields.has(orderBy) ||
    !orderDirections.has(orderDirection) ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    return HttpResponse.json(
      { message: "Invalid experiment list query." },
      { status: 400 },
    )
  }

  const terms = parseFilter(filter)
  const runCounts = new Map<string, number>()
  for (const run of runs.items) {
    runCounts.set(run.experimentId, (runCounts.get(run.experimentId) ?? 0) + 1)
  }

  const items = experiments.items
    .map((experiment) => ({
      ...experiment,
      runCount: runCounts.get(experiment.id) ?? 0,
    }))
    .filter((experiment) =>
      terms.every(({ field, term }) => {
        const values =
          field === "id"
            ? [experiment.id]
            : field === "name"
              ? [experiment.name]
              : field === "source"
                ? [experiment.source]
                : field === "all"
                  ? [experiment.id, experiment.name, experiment.source]
                  : []
        return values.some((candidate) =>
          candidate.toLowerCase().includes(term),
        )
      }),
    )
    .sort((left, right) => {
      const direction = orderDirection === "asc" ? 1 : -1
      const leftValue =
        orderBy === "name"
          ? left.name.toLowerCase()
          : orderBy === "runCount"
            ? left.runCount
            : Date.parse(left.updatedAt ?? left.createdAt)
      const rightValue =
        orderBy === "name"
          ? right.name.toLowerCase()
          : orderBy === "runCount"
            ? right.runCount
            : Date.parse(right.updatedAt ?? right.createdAt)
      if (leftValue < rightValue) return -1 * direction
      if (leftValue > rightValue) return 1 * direction
      return left.id.localeCompare(right.id)
    })

  return HttpResponse.json({
    items: items.slice(offset, offset + limit),
    metadata: { total: items.length, limit, offset },
  })
}

const listRuns = (request: Request) => {
  const url = new URL(request.url)
  const filter = url.searchParams.get("filter") ?? ""
  const orderBy = url.searchParams.get("orderBy") ?? "startedAt"
  const orderDirection = url.searchParams.get("orderDirection") ?? "desc"
  const limit = Number(url.searchParams.get("limit") ?? "10")
  const offset = Number(url.searchParams.get("offset") ?? "0")

  if (
    !runOrderFields.has(orderBy) ||
    !orderDirections.has(orderDirection) ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    return HttpResponse.json(
      { message: "Invalid run list query." },
      { status: 400 },
    )
  }

  const experimentById = new Map(
    experiments.items.map((experiment) => [experiment.id, experiment]),
  )
  const terms = parseFilter(filter)
  const items = runs.items
    .map((run) => {
      const experiment = experimentById.get(run.experimentId)
      return {
        ...run,
        experimentName: experiment?.name ?? "Unknown experiment",
        experimentSource: experiment?.source ?? "Unknown source",
      }
    })
    .filter((run) =>
      terms.every(({ field, term }) => {
        const values =
          field === "id"
            ? [run.id]
            : field === "experiment" || field === "name"
              ? [run.experimentName]
              : field === "source"
                ? [run.experimentSource]
                : field === "status"
                  ? [run.status]
                  : field === "all"
                    ? [
                        run.id,
                        run.experimentName,
                        run.experimentSource,
                        run.status,
                      ]
                    : []
        return values.some((candidate) =>
          candidate.toLowerCase().includes(term),
        )
      }),
    )
    .sort((left, right) => {
      const direction = orderDirection === "asc" ? 1 : -1
      const leftValue =
        orderBy === "experimentName"
          ? left.experimentName.toLowerCase()
          : Date.parse(
              orderBy === "endedAt"
                ? (left.endedAt ?? left.updatedAt)
                : (left.startedAt ?? left.createdAt),
            )
      const rightValue =
        orderBy === "experimentName"
          ? right.experimentName.toLowerCase()
          : Date.parse(
              orderBy === "endedAt"
                ? (right.endedAt ?? right.updatedAt)
                : (right.startedAt ?? right.createdAt),
            )
      if (leftValue < rightValue) return -1 * direction
      if (leftValue > rightValue) return 1 * direction
      return left.id.localeCompare(right.id)
    })

  return HttpResponse.json({
    items: items.slice(offset, offset + limit),
    metadata: { total: items.length, limit, offset },
  })
}

const detail = <T extends { id: string }>(
  items: T[],
  id: string,
  resource: string,
) => {
  const item = items.find((candidate) => candidate.id === id)
  return item ? HttpResponse.json(item) : notFound(resource)
}

export const experimentHandlers = [
  http.get("*/api/v1/experiments", ({ request }) => listExperiments(request)),
  http.get("*/api/v1/experiments/:experimentId", ({ params }) =>
    detail(experiments.items, String(params.experimentId), "Experiment"),
  ),
  http.get("*/api/v1/experiments/:experimentId/variants", ({ params }) =>
    collection(
      variants.items.filter(
        (variant) => variant.experimentId === String(params.experimentId),
      ),
    ),
  ),
  http.get("*/api/v1/experiments/:experimentId/runs", ({ params }) =>
    collection(
      runs.items.filter(
        (run) => run.experimentId === String(params.experimentId),
      ),
    ),
  ),
  http.get("*/api/v1/variants", () => collection(variants.items)),
  http.get("*/api/v1/variants/:variantId", ({ params }) =>
    detail(variants.items, String(params.variantId), "Variant"),
  ),
  http.get("*/api/v1/runs", ({ request }) => listRuns(request)),
  http.get("*/api/v1/runs/:runId", ({ params }) =>
    detail(runs.items, String(params.runId), "Run"),
  ),
  http.get("*/api/v1/runs/:runId/measurements", ({ params }) =>
    collection(
      measurements.items.filter(
        (measurement) => measurement.runId === String(params.runId),
      ),
    ),
  ),
  http.get("*/api/v1/measurements", () => collection(measurements.items)),
  http.get("*/api/v1/measurements/:measurementId", ({ params }) =>
    detail(
      measurements.items,
      String(params.measurementId),
      "Measurement",
    ),
  ),
  http.get("*/api/v1/comparisons", () => collection(comparisons.items)),
  http.get("*/api/v1/comparisons/:comparisonId", ({ params }) =>
    detail(comparisons.items, String(params.comparisonId), "Comparison"),
  ),
  http.get("*/api/v1/artifacts", () => collection(artifacts.items)),
  http.get("*/api/v1/artifacts/:artifactId", ({ params }) =>
    detail(artifacts.items, String(params.artifactId), "Artifact"),
  ),
  http.get("*/api/v1/container-images", () =>
    collection(containerImages.items),
  ),
  http.get("*/api/v1/container-images/:containerImageId", ({ params }) =>
    detail(
      containerImages.items,
      String(params.containerImageId),
      "Container image",
    ),
  ),
]
