const Logo = ({ size = 32, withText = true }) => {
  const gid = 'sfv-grad'
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b82f6" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="#0d1117" />
        <rect x="1.5" y="1.5" width="61" height="61" rx="12.5" stroke={`url(#${gid})`} strokeOpacity="0.5" strokeWidth="3" />
        {/* Cadenas */}
        <path d="M24 30v-4a8 8 0 0 1 16 0v4" stroke={`url(#${gid})`} strokeWidth="4" strokeLinecap="round" fill="none" />
        <rect x="20" y="30" width="24" height="18" rx="4" stroke={`url(#${gid})`} strokeWidth="4" fill="none" />
        <circle cx="32" cy="38" r="2.5" fill="#22d3ee" />
        <path d="M32 40v3.5" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {withText && (
        <span className="font-semibold text-gh-fg tracking-tight">
          Secure<span className="text-brand-cyan">Vault</span>
        </span>
      )}
    </span>
  )
}

export default Logo
