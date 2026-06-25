/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: '#3b82f6',
        'brand-cyan': '#22d3ee',
        gh: {
          canvas: '#0d1117',
          subtle: '#161b22',
          inset: '#010409',
          elevated: '#21262d',
          border: '#30363d',
          fg: '#e6edf3',
          'fg-muted': '#8b949e',
          'fg-subtle': '#6e7681',
          accent: '#2f81f7',
          'accent-subtle': 'rgba(56,139,253,0.15)',
          header: '#010409',
          'success-fg': '#3fb950',
          'success-subtle': 'rgba(63,185,80,0.15)',
          'danger-fg': '#f85149',
          'danger-subtle': 'rgba(248,81,73,0.15)',
          'attention-fg': '#d29922',
          'attention-subtle': 'rgba(210,153,34,0.15)',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Noto Sans', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      maxWidth: { changelog: '1280px' },
    },
  },
  plugins: [],
}
