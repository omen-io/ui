import { request } from "@/lib/http-client"
import type { CurrentUser, LoginRequest, Role, TokenResponse } from "./types"

const paths = {
  login: "/api/v1/auth/login",
  refresh: "/api/v1/auth/refresh",
  me: "/api/v1/auth/me",
  roles: "/api/v1/auth/roles",
} as const

export const login = (credentials: LoginRequest) =>
  request<TokenResponse>(paths.login, {
    method: "POST",
    body: credentials,
  })

export const refreshToken = () =>
  request<TokenResponse>(paths.refresh, { method: "POST" })

export const getCurrentUser = () => request<CurrentUser>(paths.me)

export const getRoles = () => request<{ items: Role[] }>(paths.roles)
