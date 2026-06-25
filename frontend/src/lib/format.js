export const formatSize = (bytes) => {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export const formatDate = (iso) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('fr-FR')
  } catch {
    return '—'
  }
}

export const VISIBILITY_META = {
  private: { label: 'Privé', pill: 'bg-gh-elevated text-gh-fg-muted' },
  shared: { label: 'Partagé', pill: 'bg-gh-attention-subtle text-gh-attention-fg' },
  public: { label: 'Public', pill: 'bg-gh-success-subtle text-gh-success-fg' },
}
