import { useState } from 'react'
import api, { tokens } from '../api/client'
import { formatSize, formatDate, VISIBILITY_META } from '../lib/format'

const baseURL = import.meta.env.VITE_API_URL || ''

// Télécharge un fichier déchiffré via fetch (pour gérer le blob + Authorization).
async function downloadFile(file) {
  const res = await fetch(`${baseURL}/api/files/${file.id}/download`, {
    headers: { Authorization: `Bearer ${tokens.access}` },
  })
  if (!res.ok) throw new Error('Téléchargement refusé')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = file.originalName
  a.click()
  URL.revokeObjectURL(url)
}

const FileList = ({ files, onChanged, currentUserId }) => {
  const [error, setError] = useState(null)

  const changeVisibility = async (file, visibility) => {
    setError(null)
    try {
      await api.patch(`/api/files/${file.id}/permission`, { visibility })
      onChanged?.()
    } catch (err) {
      setError(err.response?.data?.message || 'Échec du changement de permission')
    }
  }

  const remove = async (file) => {
    setError(null)
    try {
      await api.delete(`/api/files/${file.id}`)
      onChanged?.()
    } catch (err) {
      setError(err.response?.data?.message || 'Échec de la suppression')
    }
  }

  const copyShareLink = (file) => {
    const link = `${window.location.origin}${baseURL}/api/files/shared/${file.shareToken}`
    navigator.clipboard?.writeText(link)
  }

  if (!files.length) {
    return (
      <div className="rounded-md border border-gh-border bg-gh-subtle px-5 py-8 text-center">
        <p className="text-sm text-gh-fg-muted">Aucun fichier pour le moment.</p>
      </div>
    )
  }

  return (
    <div>
      {error && <p className="text-sm text-gh-danger-fg mb-3">{error}</p>}
      <div className="rounded-md border border-gh-border bg-gh-subtle overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gh-subtle border-b border-gh-border">
            <tr className="text-left gh-mono-label text-[10px] text-gh-fg-muted">
              <th className="px-4 py-2.5 font-normal">Nom</th>
              <th className="px-4 py-2.5 font-normal">Taille</th>
              <th className="px-4 py-2.5 font-normal">Visibilité</th>
              <th className="px-4 py-2.5 font-normal hidden md:table-cell">Ajouté le</th>
              <th className="px-4 py-2.5 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gh-border">
            {files.map((f) => {
              const meta = VISIBILITY_META[f.visibility] || VISIBILITY_META.private
              const owned = !currentUserId || String(f.owner) === String(currentUserId)
              return (
                <tr key={f.id} className="text-gh-fg">
                  <td className="px-4 py-3 font-medium truncate max-w-[220px]">{f.originalName}</td>
                  <td className="px-4 py-3 text-gh-fg-muted">{formatSize(f.size)}</td>
                  <td className="px-4 py-3">
                    {owned ? (
                      <select
                        value={f.visibility}
                        onChange={(e) => changeVisibility(f, e.target.value)}
                        className="bg-gh-canvas border border-gh-border rounded px-2 py-1 text-xs text-gh-fg focus:border-brand focus:outline-none"
                      >
                        <option value="private">Privé</option>
                        <option value="shared">Partagé</option>
                        <option value="public">Public</option>
                      </select>
                    ) : (
                      <span className={`gh-mono-label text-[10px] px-2 py-0.5 rounded-full ${meta.pill}`}>{meta.label}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gh-fg-subtle hidden md:table-cell">{formatDate(f.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => downloadFile(f).catch((e) => setError(e.message))}
                        className="px-2.5 py-1 text-xs rounded-md border border-gh-border text-gh-fg hover:bg-gh-elevated transition-colors"
                      >
                        Télécharger
                      </button>
                      {f.visibility === 'shared' && f.shareToken && (
                        <button
                          onClick={() => copyShareLink(f)}
                          className="px-2.5 py-1 text-xs rounded-md border border-gh-border text-gh-fg-muted hover:text-gh-fg hover:bg-gh-elevated transition-colors"
                        >
                          Copier le lien
                        </button>
                      )}
                      {owned && (
                        <button
                          onClick={() => remove(f)}
                          className="px-2.5 py-1 text-xs rounded-md border border-gh-danger-fg/40 text-gh-danger-fg hover:bg-gh-danger-subtle transition-colors"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default FileList
