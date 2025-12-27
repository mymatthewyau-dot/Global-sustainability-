/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'wqi-excellent': '#10b981',
        'wqi-good': '#3b82f6',
        'wqi-moderate': '#f59e0b',
        'wqi-poor': '#ef4444',
      },
    },
  },
  plugins: [],
}

