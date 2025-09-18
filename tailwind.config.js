/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        'foreground': 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}

module.exports = config
