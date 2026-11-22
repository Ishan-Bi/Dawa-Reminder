/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT:  '#4BAE9A',
          hover:    '#368F7E',
          light:    '#D5F0E9',
          soft:     '#BCE5DA',
          softer:   '#E9F7F3',
          text:     '#287666',
          muted:    '#62B6A3',
          border:   '#BCE5DA',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          bg:      '#F2F8F5',
          border:  '#DDEBE5',
          hover:   '#F3F9F6',
          raised:  '#F8FBF9',
        },
        ink: {
          DEFAULT: '#263A32',
          muted:   '#708278',
          subtle:  '#91A199',
          faint:   '#D6E1DB',
        },
        status: {
          taken:   { DEFAULT: '#16A34A', bg: '#DCFCE7', text: '#166534', border: '#86EFAC' },
          pending: { DEFAULT: '#CA8A04', bg: '#FEF9C3', text: '#854D0E', border: '#FDE047' },
          missed:  { DEFAULT: '#DC2626', bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
          skipped: { DEFAULT: '#64748B', bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' },
        },
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        sans:    ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        card:  '20px',
        modal: '16px',
        pill:  '9999px',
        btn:   '12px',
        xl2:   '20px',
      },
      boxShadow: {
        card:   '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-md': '0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        modal:  '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
        focus:  '0 0 0 3px rgb(15 118 110 / 0.25)',
        'focus-err': '0 0 0 3px rgb(220 38 38 / 0.20)',
        sidebar:'2px 0 8px 0 rgb(0 0 0 / 0.04)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        shimmer:   'shimmer 2s linear infinite',
        fadeIn:    'fadeIn 200ms ease-out',
        slideUp:   'slideUp 200ms ease-out',
        slideDown: 'slideDown 200ms ease-out',
        scaleIn:   'scaleIn 150ms ease-out',
      },
    },
  },
  plugins: [],
}
