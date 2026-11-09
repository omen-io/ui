const ACCESS_TOKEN_KEY = "omen_access_token"

export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(accessToken: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
}

export function clearAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
}
