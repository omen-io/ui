import { afterEach, describe, expect, it, vi } from "vitest"
import { request } from "./http-client"

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("request", () => {
  it("preserves JSON artifact bodies as text when requested", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response('{"requestId":"search-2001","limit":3}', {
          headers: { "Content-Type": "application/json" },
        }),
      ),
    )

    await expect(
      request<string>("https://storage.example.test/input.json", {
        responseType: "text",
      }),
    ).resolves.toBe('{"requestId":"search-2001","limit":3}')
  })
})
