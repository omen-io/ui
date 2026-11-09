export class HttpError extends Error {
  readonly status: number
  readonly details: unknown

  constructor(
    status: number,
    details: unknown,
  ) {
    super(`HTTP request failed with status ${status}.`)
    this.name = "HttpError"
    this.status = status
    this.details = details
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown
  responseType?: "auto" | "text"
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { responseType = "auto", ...fetchOptions } = options
  const url = new URL(path, import.meta.env.VITE_API_BASE_URL).toString()
  const headers = new Headers(fetchOptions.headers)
  const accessToken = localStorage.getItem("omen_access_token") ??
    import.meta.env.VITE_API_ACCESS_TOKEN

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`)
  }

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(url, {
    ...fetchOptions,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    headers,
  })

  const contentType = response.headers.get("content-type") ?? ""
  const details =
    responseType !== "text" && contentType.includes("application/json")
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    throw new HttpError(response.status, details)
  }

  return details as T
}
