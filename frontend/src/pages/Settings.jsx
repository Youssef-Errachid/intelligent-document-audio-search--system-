import { LogOut, ShieldCheck, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
          Workspace
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Settings
        </h2>
        <p className="mt-2 text-base leading-7 text-slate-500 dark:text-slate-400">
          Manage your account and workspace preferences.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <User size={18} aria-hidden="true" />
          <h3 className="text-lg font-semibold">Account</h3>
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Name</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">{user?.name}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Email</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">{user?.email}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Role</dt>
            <dd className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 font-medium capitalize text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
              <ShieldCheck size={14} aria-hidden="true" />
              {user?.role}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <LogOut size={16} aria-hidden="true" />
          Log out
        </button>
      </div>
    </section>
  )
}
