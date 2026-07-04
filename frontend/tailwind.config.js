/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgDark: '#0a0f1e',
        bgCard: '#111827',
        bgCardHover: 'rgba(17, 24, 39, 0.85)',
        bgSidebar: '#0d1528',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderHover: 'rgba(99, 102, 241, 0.25)',
        textPrimary: '#f1f5f9',
        textSecondary: '#94a3b8',
        textMuted: '#475569',
        primaryColor: '#6366f1',
        secondaryColor: '#8b5cf6',
        emeraldColor: '#10b981',
        amberColor: '#f59e0b',
        roseColor: '#ef4444',
        blueColor: '#06b6d4',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'grad-primary': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'grad-cyan': 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
        'grad-emerald': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'grad-cosmic': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'grad-pink': 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      },
      boxShadow: {
        'main': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'premium-3d': 'inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'glow-orange': '0 0 20px rgba(99, 102, 241, 0.15)',
        'glow-cyan': '0 0 20px rgba(99, 102, 241, 0.15)',
        'glow-pink': '0 0 20px rgba(139, 92, 246, 0.15)',
      }
    },
  },
  plugins: [],
}
