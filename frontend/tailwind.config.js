/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgDark: '#050506',
        bgCard: 'rgba(20, 20, 24, 0.5)',
        bgCardHover: 'rgba(30, 30, 36, 0.7)',
        bgSidebar: '#09090b',
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderHover: 'rgba(56, 189, 248, 0.25)',
        textPrimary: '#f3f4f6',
        textSecondary: '#9ca3af',
        textMuted: '#575c75',
        primaryColor: '#38bdf8',
        secondaryColor: '#ec4899',
        emeraldColor: '#10b981',
        amberColor: '#fbbf24',
        roseColor: '#ef4444',
        blueColor: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'grad-primary': 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
        'grad-cyan': 'linear-gradient(135deg, #38bdf8 0%, #ec4899 100%)',
        'grad-emerald': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'grad-cosmic': 'linear-gradient(135deg, #38bdf8 0%, #ec4899 100%)',
        'grad-pink': 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      },
      boxShadow: {
        'main': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'premium-3d': 'inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'glow-orange': '0 0 20px rgba(56, 189, 248, 0.15)',
        'glow-cyan': '0 0 20px rgba(56, 189, 248, 0.15)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.15)',
      }
    },
  },
  plugins: [],
}
