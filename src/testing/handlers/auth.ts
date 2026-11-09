import { http, HttpResponse } from "msw"

import currentUser from "@/testing/fixtures/auth/current-user.json"
import roles from "@/testing/fixtures/auth/roles.json"
import tokenResponse from "@/testing/fixtures/auth/token-response.json"

const unauthorized = () =>
  HttpResponse.json({ message: "Invalid credentials." }, { status: 401 })

const getUserIdFromToken = (request: Request) => {
  const authorization = request.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) {
    return null
  }

  const payload = authorization.slice("Bearer ".length).split(".")[1]
  if (!payload) {
    return null
  }

  try {
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    const claims = JSON.parse(decoded) as {sub?: unknown}
    return typeof claims.sub === "string" ? claims.sub : null
  } catch {
    return null
  }
}

export const authHandlers = [
  http.post("*/api/v1/auth/login", async ({ request }) => {
    const body = (await request.json().catch(() => null)) as {
      email?: string
    } | null

    if (!body?.email) {
      return HttpResponse.json(
        { message: "An email is required." },
        { status: 400 },
      )
    }

    if (body.email !== currentUser.email) {
      return unauthorized()
    }

    return HttpResponse.json(tokenResponse)
  }),
  http.post("*/api/v1/auth/refresh", () => HttpResponse.json(tokenResponse)),
  http.get("*/api/v1/auth/roles", () => HttpResponse.json(roles)),
  http.get("*/api/v1/auth/me", ({ request }) => {
    if (getUserIdFromToken(request) !== currentUser.id) {
      return unauthorized()
    }

    return HttpResponse.json(currentUser)
  }),
]
