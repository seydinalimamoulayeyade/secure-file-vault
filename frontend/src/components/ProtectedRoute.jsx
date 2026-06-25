import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Garde de route : redirige vers /login si non authentifié.
// `adminOnly` restreint en plus aux administrateurs.
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gh-canvas">
        <p className="gh-mono-label text-sm text-gh-fg-muted">Chargement…</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />

  return children
}

export default ProtectedRoute
