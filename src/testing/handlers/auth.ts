import { http, HttpResponse } from "msw"

import currentUser from "@/testing/fixtures/auth/current-user.json"
import roles from "@/testing/fixtures/auth/roles.json"
import tokenResponse from "@/testing/fixtures/auth/token-response.json"

const unauthorized = () =>
  HttpResponse.json({ message: "Invalid credentials." }, { status: 401 })

export const authHandlers = [
  http.post("/api/v1/auth/login", async ({ request }) => {
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
  http.post("/api/v1/auth/refresh", () => HttpResponse.json(tokenResponse)),
  http.get("/api/v1/auth/roles", () => HttpResponse.json(roles)),
  http.get("/api/v1/auth/me", ({ request }) => {
    if (!request.headers.get("authorization")) {
      return unauthorized()
    }

    return HttpResponse.json(currentUser)
  }),
]
