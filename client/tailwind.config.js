/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          bg: '#0B0E14',
          card: '#131822',
          surface: '#1A2232',
          border: '#1E2638',
          'border-subtle': '#161D2B',
          text: '#F8FAFC',
          muted: '#94A3B8',
          subtle: '#64748B',
          recovered: '#10B981',
          risk: '#EF4444',
          warning: '#F59E0B',
          accent: '#3B82F6',
        }
      },
      boxShadow: {
        'card': '0 2px 8px 0 rgba(0, 0, 0, 0.4)',
        'panel': '0 10px 30px -5px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}
