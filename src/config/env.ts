const parseBoolean = (name: string, value: string | undefined): boolean => {
  if (value === "true") return true
  if (value === "false") return false
  throw new Error(`${name} must be either "true" or "false".`)
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

if (!apiBaseUrl) {
  throw new Error("VITE_API_BASE_URL is required.")
}

export const env = {
  apiBaseUrl: apiBaseUrl.endsWith("/") ? apiBaseUrl.slice(0, -1) : apiBaseUrl,
  useFixtures: parseBoolean("VITE_USE_FIXTURES", import.meta.env.VITE_USE_FIXTURES),
} as const
