import {afterAll, afterEach, beforeAll, describe, expect, it} from "vitest"
import {setupServer} from "msw/node"

import currentUser from "@/testing/fixtures/auth/current-user.json"
import tokenResponse from "@/testing/fixtures/auth/token-response.json"
import {authHandlers} from "./auth"

const server = setupServer(...authHandlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe("auth handlers", () => {
    it("resolves the current user from the JWT subject", async () => {
        const response = await fetch("http://localhost/api/v1/auth/me", {
            headers: {Authorization: `${tokenResponse.tokenType} ${tokenResponse.accessToken}`},
        })

        expect(response.status).toBe(200)
        await expect(response.json()).resolves.toEqual(currentUser)
    })

    it("rejects a token for a different user", async () => {
        const token = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJvdGhlci11c2VyIn0.fixture"
        const response = await fetch("http://localhost/api/v1/auth/me", {
            headers: {Authorization: `Bearer ${token}`},
        })

        expect(response.status).toBe(401)
    })
})
