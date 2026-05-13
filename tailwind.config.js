/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        clinic: {
          primary: '#1A3A6B',
          accent: '#2563EB',
          surface: '#FFFFFF',
          background: '#F3F4F6',
          text: '#111827',
          muted: '#6B7280',
          danger: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
