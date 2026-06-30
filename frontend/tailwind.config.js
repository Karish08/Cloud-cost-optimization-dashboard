/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgDark: '#080914',
        bgCard: 'rgba(18, 20, 38, 0.65)',
        bgCardHover: 'rgba(26, 29, 54, 0.8)',
        bgSidebar: '#0b0c1b',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderHover: 'rgba(255, 255, 255, 0.15)',
        textPrimary: '#f1f3fa',
        textSecondary: '#8e94b2',
        textMuted: '#575c75',
        primaryColor: 'hsl(262, 83%, 62%)',
        secondaryColor: 'hsl(192, 95%, 48%)',
        emeraldColor: '#10b981',
        amberColor: '#f59e0b',
        roseColor: '#ef4444',
        blueColor: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'grad-primary': 'linear-gradient(135deg, hsl(262, 83%, 62%) 0%, hsl(230, 85%, 60%) 100%)',
        'grad-cyan': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
        'grad-emerald': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'grad-cosmic': 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
      },
      boxShadow: {
        'main': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
