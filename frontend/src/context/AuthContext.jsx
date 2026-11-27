import { useEffect, useMemo, useState } from 'react'
import * as authService from '../services/authService'
import { onSessionExpired, setAccessToken } from '../services/authToken'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Restore the session on page load using the httpOnly refresh cookie.
    useEffect(() => {
        let cancelled = false
        authService
            .restoreSession()
            .then((restoredUser) => {
                if (!cancelled) setUser(restoredUser)
            })
            .catch(() => {
                // no valid session: stay logged out
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => {
            cancelled = true
        }
    }, [])

    // The axios interceptor calls this when refreshing fails.
    useEffect(() => onSessionExpired(() => setUser(null)), [])

    const value = useMemo(
        () => ({
            user,
            loading,
            async login(credentials) {
                setUser(await authService.login(credentials))
            },
            async register(details) {
                setUser(await authService.register(details))
            },
            async logout() {
                try {
                    await authService.logout()
                } catch {
                    // the local session is cleared either way
                }
                setAccessToken(null)
                setUser(null)
            },
        }),
        [user, loading],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
