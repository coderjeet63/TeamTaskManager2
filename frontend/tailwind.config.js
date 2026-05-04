/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#06111f',
        mist: '#a9c2dd',
        line: 'rgba(148, 163, 184, 0.18)',
        panel: 'rgba(8, 15, 28, 0.76)',
        panelStrong: 'rgba(10, 18, 31, 0.92)',
        accent: {
          DEFAULT: '#38bdf8',
          soft: '#67e8f9',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#f97316',
      },
      fontFamily: {
        body: ['"DM Sans"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 20px 60px rgba(2, 8, 23, 0.45)',
        glow: '0 0 0 1px rgba(103, 232, 249, 0.18), 0 25px 80px rgba(56, 189, 248, 0.18)',
      },
      backgroundImage: {
        'hero-grid':
          'linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
