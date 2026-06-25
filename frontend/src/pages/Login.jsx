import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'login') {
        await login(form.username, form.password)
      } else {
        await register(form.username, form.email, form.password)
      }
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen gh-grid flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo size={40} />
        </div>

        <div className="rounded-md border border-gh-border bg-gh-subtle p-6">
          <h1 className="text-lg font-semibold text-gh-fg mb-1">
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h1>
          <p className="text-sm text-gh-fg-muted mb-5">
            {mode === 'login' ? 'Accédez à votre coffre-fort' : 'Rejoignez le coffre-fort sécurisé'}
          </p>

          {error && (
            <div className="mb-4 rounded-md border border-gh-danger-fg/40 bg-gh-danger-subtle px-3 py-2">
              <p className="text-sm text-gh-danger-fg">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block gh-mono-label text-[11px] text-gh-fg-muted mb-1.5">
                {mode === 'login' ? "Nom d'utilisateur ou email" : "Nom d'utilisateur"}
              </label>
              <input
                name="username"
                value={form.username}
                onChange={onChange}
                required
                autoComplete="username"
                className="w-full rounded-md bg-gh-canvas border border-gh-border px-3 py-2 text-sm text-gh-fg focus:border-brand focus:outline-none"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block gh-mono-label text-[11px] text-gh-fg-muted mb-1.5">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  autoComplete="email"
                  className="w-full rounded-md bg-gh-canvas border border-gh-border px-3 py-2 text-sm text-gh-fg focus:border-brand focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block gh-mono-label text-[11px] text-gh-fg-muted mb-1.5">Mot de passe</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full rounded-md bg-gh-canvas border border-gh-border px-3 py-2 text-sm text-gh-fg focus:border-brand focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-2 text-sm font-medium rounded-md text-white bg-gradient-to-r from-brand to-brand-cyan hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {busy ? '…' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gh-fg-muted mt-4">
          {mode === 'login' ? 'Pas encore de compte ?' : 'Déjà inscrit ?'}{' '}
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError(null)
            }}
            className="text-brand-cyan hover:underline"
          >
            {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login
