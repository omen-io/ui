export type TokenResponse = {
  accessToken: string
  tokenType: string
  expiresIn: number
}

export type CurrentUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  roles: string[]
  entitlements: string[]
}

export type Role = {
  id: string
  name: string
  permissions: string[]
}

export type LoginRequest = {
  email: string
  password: string
}
