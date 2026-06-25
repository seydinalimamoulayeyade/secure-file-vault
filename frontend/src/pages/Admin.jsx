import { useState, useEffect, useCallback } from 'react'
import api from '../api/client'
import FileList from '../components/FileList'
import { formatDate } from '../lib/format'

const ACTION_META = {
  register: 'text-gh-fg-muted',
  login: 'text-gh-success-fg',
  logout: 'text-gh-fg-muted',
  upload: 'text-brand-cyan',
  download: 'text-gh-fg',
  download_shared: 'text-gh-fg',
  delete: 'text-gh-danger-fg',
  permission_change: 'text-gh-attention-fg',
}

const Tab = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
      active ? 'bg-gh-elevated text-gh-fg' : 'text-gh-fg-muted hover:text-gh-fg'
    }`}
  >
    {children}
  </button>
)

const Admin = () => {
  const [tab, setTab] = useState('files')
  const [files, setFiles] = useState([])
  const [audit, setAudit] = useState([])
  const [error, setError] = useState(null)

  const loadFiles = useCallback(async () => {
    try {
      const { data } = await api.get('/api/admin/files')
      setFiles(data.data.map((f) => ({ ...f, owner: f.owner?._id || f.owner })))
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de chargement')
    }
  }, [])

  const loadAudit = useCallback(async () => {
    try {
      const { data } = await api.get('/api/admin/audit', { params: { limit: 100 } })
      setAudit(data.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de chargement')
    }
  }, [])

  useEffect(() => {
    if (tab === 'files') loadFiles()
    else loadAudit()
  }, [tab, loadFiles, loadAudit])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Tab active={tab === 'files'} onClick={() => setTab('files')}>Tous les fichiers</Tab>
        <Tab active={tab === 'audit'} onClick={() => setTab('audit')}>Journal d'audit</Tab>
      </div>

      {error && (
        <div className="rounded-md border border-gh-danger-fg/40 bg-gh-danger-subtle px-4 py-3">
          <p className="text-sm text-gh-danger-fg">{error}</p>
        </div>
      )}

      {tab === 'files' ? (
        <FileList files={files} onChanged={loadFiles} />
      ) : (
        <div className="rounded-md border border-gh-border bg-gh-subtle overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gh-border">
              <tr className="text-left gh-mono-label text-[10px] text-gh-fg-muted">
                <th className="px-4 py-2.5 font-normal">Date</th>
                <th className="px-4 py-2.5 font-normal">Utilisateur</th>
                <th className="px-4 py-2.5 font-normal">Action</th>
                <th className="px-4 py-2.5 font-normal">Fichier</th>
                <th className="px-4 py-2.5 font-normal hidden md:table-cell">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gh-border">
              {audit.map((a) => (
                <tr key={a._id} className="text-gh-fg">
                  <td className="px-4 py-2.5 gh-mono-label text-[11px] text-gh-fg-muted">{formatDate(a.createdAt)}</td>
                  <td className="px-4 py-2.5">{a.username || '—'}</td>
                  <td className={`px-4 py-2.5 gh-mono-label text-[11px] ${ACTION_META[a.action] || 'text-gh-fg'}`}>{a.action}</td>
                  <td className="px-4 py-2.5 text-gh-fg-muted truncate max-w-[200px]">{a.fileName || '—'}</td>
                  <td className="px-4 py-2.5 text-gh-fg-subtle hidden md:table-cell">{a.ip || '—'}</td>
                </tr>
              ))}
              {!audit.length && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gh-fg-muted text-sm">
                    Aucune entrée d'audit.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Admin
