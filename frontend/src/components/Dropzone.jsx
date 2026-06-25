import { useState, useRef } from 'react'
import api from '../api/client'

const ACCEPT = '.pdf,.txt,.docx,.png,.jpg,.jpeg'

// Zone d'upload par glisser-déposer ou sélection.
const Dropzone = ({ onUploaded }) => {
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const upload = async (file) => {
    if (!file) return
    setError(null)
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      await api.post('/api/files', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      onUploaded?.()
    } catch (err) {
      setError(err.response?.data?.message || "Échec de l'upload")
    } finally {
      setBusy(false)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    upload(e.dataTransfer.files?.[0])
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-md border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? 'border-brand bg-gh-accent-subtle' : 'border-gh-border bg-gh-subtle hover:border-gh-fg-subtle'
        }`}
      >
        <p className="text-sm text-gh-fg">
          {busy ? 'Chiffrement et upload…' : 'Glissez un fichier ici ou cliquez pour sélectionner'}
        </p>
        <p className="gh-mono-label text-[11px] text-gh-fg-subtle mt-2">
          pdf · txt · docx · png · jpg — max 10 Mo
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => upload(e.target.files?.[0])}
        />
      </div>
      {error && <p className="text-sm text-gh-danger-fg mt-2">{error}</p>}
    </div>
  )
}

export default Dropzone
