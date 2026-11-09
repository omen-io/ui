import * as React from "react"

import {getCurrentUser} from "@/features/auth/api"
import type {CurrentUser} from "@/features/auth/types"

export function useProfile() {
    const [user, setUser] = React.useState<CurrentUser | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<Error | null>(null)

    const loadUser = React.useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            setUser(await getCurrentUser())
        } catch (cause) {
            setError(cause instanceof Error ? cause : new Error("Unable to load profile."))
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        const timer = window.setTimeout(() => void loadUser(), 0)
        return () => window.clearTimeout(timer)
    }, [loadUser])

    return {user, loading, error, retry: loadUser}
}
