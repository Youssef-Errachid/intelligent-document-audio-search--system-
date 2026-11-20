import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'documind.theme'

function getInitialTheme() {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export default function useTheme() {
    const [theme, setThemeState] = useState(getInitialTheme)

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
    }, [theme])

    const setTheme = useCallback((next) => {
        setThemeState(next)
        try {
            localStorage.setItem(STORAGE_KEY, next)
        } catch {
        }
    }, [])

    return { theme, setTheme }
}