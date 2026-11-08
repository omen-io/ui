import { http, HttpResponse } from "msw"

import artifacts from "@/testing/fixtures/experiments/artifacts.json"
import artifactFiles from "@/testing/fixtures/experiments/artifact-files.json"
import checkoutInput from "@/testing/fixtures/files/inputs/checkout-sample.json?raw"
import checkoutControl from "@/testing/fixtures/files/measurements/checkout-ranking-control.json?raw"
import checkoutCandidate from "@/testing/fixtures/files/measurements/checkout-ranking-candidate.json?raw"
import checkoutComparison from "@/testing/fixtures/files/comparisons/checkout-ranking-comparison.diff?raw"
import checkoutCsvControl from "@/testing/fixtures/files/measurements/checkout-ranking-control.csv?raw"
import checkoutCsvCandidate from "@/testing/fixtures/files/measurements/checkout-ranking-candidate.csv?raw"
import checkoutCsvComparison from "@/testing/fixtures/files/comparisons/checkout-ranking-comparison.csv.diff?raw"
import searchInput from "@/testing/fixtures/files/inputs/search-sample.json?raw"
import latencyInput from "@/testing/fixtures/files/inputs/latency-sample.json?raw"
import checkoutRetry from "@/testing/fixtures/files/measurements/checkout-ranking-control-retry.json?raw"
import searchControl from "@/testing/fixtures/files/measurements/search-relevance-control.json?raw"
import searchCandidate from "@/testing/fixtures/files/measurements/search-relevance-candidate.json?raw"
import searchComparison from "@/testing/fixtures/files/comparisons/search-relevance-comparison.diff?raw"
import latencyControl from "@/testing/fixtures/files/measurements/latency-guardrails-control.xml?raw"
import latencyCandidate from "@/testing/fixtures/files/measurements/latency-guardrails-candidate.xml?raw"
import latencyComparison from "@/testing/fixtures/files/comparisons/latency-guardrails-comparison.diff?raw"
import paymentComparison from "@/testing/fixtures/files/comparisons/payment-authorization-comparison.diff?raw"
import paymentCandidate from "@/testing/fixtures/files/measurements/payment-authorization-candidate.json?raw"
import paymentControl from "@/testing/fixtures/files/measurements/payment-authorization-control.json?raw"

const fixtureStorageHost = "https://fixture-storage.example.test"
const fixtureExpiresAt = "2029-12-31T23:59:59Z"

const fileContents: Record<string, string> = {
  "inputs/checkout-sample.json": checkoutInput,
  "measurements/checkout-ranking-control.json": checkoutControl,
  "measurements/checkout-ranking-candidate.json": checkoutCandidate,
  "comparisons/checkout-ranking-comparison.diff": checkoutComparison,
  "measurements/checkout-ranking-control.csv": checkoutCsvControl,
  "measurements/checkout-ranking-candidate.csv": checkoutCsvCandidate,
  "comparisons/checkout-ranking-comparison.csv.diff": checkoutCsvComparison,
  "inputs/search-sample.json": searchInput,
  "inputs/latency-sample.json": latencyInput,
  "measurements/checkout-ranking-control-retry.json": checkoutRetry,
  "measurements/search-relevance-control.json": searchControl,
  "measurements/search-relevance-candidate.json": searchCandidate,
  "comparisons/search-relevance-comparison.diff": searchComparison,
  "measurements/latency-guardrails-control.xml": latencyControl,
  "measurements/latency-guardrails-candidate.xml": latencyCandidate,
  "comparisons/latency-guardrails-comparison.diff": latencyComparison,
  "comparisons/payment-authorization-comparison.diff": paymentComparison,
  "measurements/payment-authorization-control.json": paymentControl,
  "measurements/payment-authorization-candidate.json": paymentCandidate,
}

export const artifactHandlers = [
  http.get(
    "/api/v1/artifacts/:artifactId/presigned-url",
    ({ params }) => {
      const artifactId = String(params.artifactId)
      const artifact = artifacts.items.find((item) => item.id === artifactId)
      const file = artifactFiles.items.find(
        (item) => item.artifactId === artifactId,
      )

      if (!artifact || !file) {
        return HttpResponse.json(
          { message: "Artifact not found." },
          { status: 404 },
        )
      }

      const url = new URL(
        `${fixtureStorageHost}/${artifact.bucket}/${artifact.objectKey}`,
      )
      url.searchParams.set("X-Amz-Algorithm", "AWS4-HMAC-SHA256")
      url.searchParams.set(
        "X-Amz-Credential",
        "fixture-access/20291231/auto/s3/aws4_request",
      )
      url.searchParams.set("X-Amz-Date", "20291231T000000Z")
      url.searchParams.set("X-Amz-Expires", "3600")
      url.searchParams.set("X-Amz-SignedHeaders", "host")
      url.searchParams.set("X-Amz-Signature", "fixture-signature")

      return HttpResponse.json({
        url: url.toString(),
        expiresAt: fixtureExpiresAt,
      })
    },
  ),
  http.get(/https:\/\/fixture-storage\.example\.test\/.+/, ({ request }) => {
    const url = new URL(request.url)
    const objectKey = url.pathname.split("/").slice(2).join("/")
    const artifact = artifacts.items.find(
      (item) => item.objectKey === objectKey,
    )
    const file = artifactFiles.items.find(
      (item) => item.artifactId === artifact?.id,
    )
    const content = file
      ? fileContents[file.fixturePath.replace(/^files\//, "")]
      : undefined

    if (!content || !artifact || !file) {
      return new HttpResponse("Artifact not found.", { status: 404 })
    }

    return new HttpResponse(content, {
      headers: { "Content-Type": artifact.contentType },
    })
  }),
]
