import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import AuthShell from '../components/auth/AuthShell'
import { AuthError, AuthField, AuthSubmit } from '../components/auth/AuthFields'
import { useAuth } from '../hooks/useAuth'

export default function Register() {
    const { user, loading, register } = useAuth()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    if (!loading && user) {
        return <Navigate to="/" replace />
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')

        if (password.length < 8) {
            setError('Password must be at least 8 characters.')
            return
        }
        if (password !== confirm) {
            setError('Passwords do not match.')
            return
        }

        setSubmitting(true)
        try {
            await register({ email, password, name })
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AuthShell
            title="Create your account"
            subtitle="Your documents and audio, searchable and private"
            footer={{ text: 'Already have an account?', to: '/login', label: 'Log in' }}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <AuthError message={error} />
                <AuthField
                    label="Name"
                    autoComplete="name"
                    placeholder="Your name"
                    required
                    maxLength={100}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />
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
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    maxLength={72}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                <AuthField
                    label="Confirm password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    required
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                />
                <AuthSubmit loading={submitting}>Create account</AuthSubmit>
            </form>
        </AuthShell>
    )
}
