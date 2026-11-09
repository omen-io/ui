import { request } from "@/lib/http-client"
import {setAccessToken} from "./session"
import type { CurrentUser, LoginRequest, Role, TokenResponse } from "./types"

const paths = {
  login: "/api/v1/auth/login",
  refresh: "/api/v1/auth/refresh",
  me: "/api/v1/auth/me",
  roles: "/api/v1/auth/roles",
} as const

export const login = async (credentials: LoginRequest) => {
  const response = await request<TokenResponse>(paths.login, {
    method: "POST",
    body: credentials,
  })
  setAccessToken(response.accessToken)
  return response
}

export const refreshToken = async () => {
  const response = await request<TokenResponse>(paths.refresh, { method: "POST" })
  setAccessToken(response.accessToken)
  return response
}

export const getCurrentUser = () => request<CurrentUser>(paths.me)

export const getRoles = () => request<{ items: Role[] }>(paths.roles)
