import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens - Royal Rasoi palette
        ivory: {
          50: '#FDFDF7',
          100: '#FAF9F0',
          200: '#F5F3E4',
          DEFAULT: '#F5F3E4',
        },
        forest: {
          50: '#E8F0E8',
          100: '#C5D9C5',
          200: '#8BB58B',
          300: '#5A8F5A',
          400: '#2D6B2D',
          500: '#1A5C1A',
          600: '#164E16',
          700: '#113F11',
          800: '#0D310D',
          DEFAULT: '#1A5C1A',
        },
        gold: {
          50: '#FDF8E8',
          100: '#FAEEC5',
          200: '#F5DC8A',
          300: '#EECA50',
          400: '#D4AF37',
          500: '#B8941F',
          DEFAULT: '#D4AF37',
        },
        charcoal: {
          50: '#F5F5F4',
          100: '#E7E5E4',
          200: '#D6D3D1',
          300: '#A8A29E',
          400: '#78716C',
          500: '#57534E',
          600: '#44403C',
          700: '#292524',
          800: '#1C1917',
          900: '#0C0A09',
          DEFAULT: '#292524',
        },
        status: {
          available: '#16A34A',
          booked: '#DC2626',
          waiting: '#D97706',
          reserved: '#7C3AED',
        }
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-green': 'pulseGreen 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        scaleIn: { '0%': { transform: 'scale(0.95)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        pulseGreen: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
        'elevated': '0 16px 48px rgba(0,0,0,0.12)',
        'inner-soft': 'inset 0 2px 6px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
export default config
