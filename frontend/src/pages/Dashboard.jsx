import { useState, useEffect, useCallback } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import Dropzone from '../components/Dropzone'
import FileList from '../components/FileList'

const Dashboard = () => {
  const { user } = useAuth()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/files')
      setFiles(data.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger les fichiers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-semibold text-gh-fg text-sm mb-4">Déposer un fichier</h2>
        <Dropzone onUploaded={load} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gh-fg text-sm">Mes fichiers</h2>
          <span className="gh-mono-label text-[11px] text-gh-fg-muted">{files.length}</span>
        </div>
        {loading ? (
          <p className="gh-mono-label text-sm text-gh-fg-muted">Chargement…</p>
        ) : error ? (
          <div className="rounded-md border border-gh-danger-fg/40 bg-gh-danger-subtle px-4 py-3">
            <p className="text-sm text-gh-danger-fg">{error}</p>
          </div>
        ) : (
          <FileList files={files} onChanged={load} currentUserId={user?.id} />
        )}
      </section>
    </div>
  )
}

export default Dashboard
