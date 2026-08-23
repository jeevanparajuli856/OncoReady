/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FFFDF5',
        ink: '#1E293B',
        muted: {
          DEFAULT: '#F1F5F9',
          fg: '#64748B',
        },
        accent: {
          DEFAULT: '#8B5CF6',
          fg: '#FFFFFF',
        },
        pop: '#F472B6',
        sun: '#FBBF24',
        mint: '#34D399',
        line: '#E2E8F0',
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        clinical: {
          teal: '#0D9488',
          cyan: '#0284C7',
          amber: '#D97706',
          emerald: '#059669',
          rose: '#DC2626',
        }
      },
      fontFamily: {
        display: ['Syne', 'Outfit', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'Syne', 'system-ui', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '16px',
        lg: '24px',
      },
      borderWidth: {
        3: '3px',
      },
      boxShadow: {
        pop: '4px 4px 0 0 #1E293B',
        'pop-lg': '8px 8px 0 0 #1E293B',
        'pop-pink': '8px 8px 0 0 #F472B6',
        'pop-sun': '8px 8px 0 0 #FBBF24',
        'pop-mint': '8px 8px 0 0 #34D399',
        'pop-soft': '8px 8px 0 0 #E2E8F0',
        'pop-accent': '4px 4px 0 0 #8B5CF6',
        'glow-emerald': '0 0 20px -3px rgba(52, 211, 153, 0.35)',
        'glow-amber': '0 0 20px -3px rgba(251, 191, 36, 0.35)',
        'glow-indigo': '0 0 20px -3px rgba(139, 92, 246, 0.35)',
      },
      transitionTimingFunction: {
        bouncey: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        'pulse-subtle': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        pop: 'popIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        wiggle: 'wiggle 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        marquee: 'marquee 28s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.86)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '33%': { transform: 'rotate(3deg)' },
          '66%': { transform: 'rotate(-3deg)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      }
    },
  },
  plugins: [],
}
