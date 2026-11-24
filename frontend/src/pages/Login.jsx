import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import AuthShell from '../components/auth/AuthShell'
import { AuthError, AuthField, AuthSubmit } from '../components/auth/AuthFields'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
    const { user, loading, login } = useAuth()
    const location = useLocation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const from = location.state?.from || '/'

    if (!loading && user) {
        return <Navigate to={from} replace />
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')
        setSubmitting(true)
        try {
            await login({ email, password })
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AuthShell
            title="Welcome back"
            subtitle="Log in to your DocuMind AI workspace"
            footer={{ text: "Don't have an account?", to: '/register', label: 'Create one' }}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <AuthError message={error} />
                <AuthField
                    label="Email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
                <AuthField
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Your password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                <AuthSubmit loading={submitting}>Log in</AuthSubmit>
            </form>
        </AuthShell>
    )
}
