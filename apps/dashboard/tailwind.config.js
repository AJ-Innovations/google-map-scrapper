/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0b',
        'bg-secondary': '#121214',
        'bg-tertiary': '#1a1a1e',
        'text-primary': '#ffffff',
        'text-secondary': '#a1a1a9',
        'text-muted': '#71717a',
        'accent-primary': '#3b82f6',
        'accent-hover': '#2563eb',
        'accent-glow': 'rgba(59, 130, 246, 0.15)',
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'border-color': 'rgba(255, 255, 255, 0.08)',
        'border-hover': 'rgba(255, 255, 255, 0.15)',
        'glass-bg': 'rgba(18, 18, 20, 0.6)',
        'glass-border': 'rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [],
};
