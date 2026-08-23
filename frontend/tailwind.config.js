/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F4F7FB',
        ink: '#0F172A',
        muted: {
          DEFAULT: '#EEF2F7',
          fg: '#5B6576',
        },
        accent: {
          DEFAULT: '#4F46E5',
          fg: '#FFFFFF',
        },
        pop: '#F97316',
        sun: '#F59E0B',
        mint: '#059669',
        line: '#E2E8F0',
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#4F46E5',
          600: '#4338CA',
          700: '#3730A3',
          800: '#312E81',
          900: '#1E1B4B',
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
        display: ['Syne', 'Outfit', 'Poppins', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'Outfit', 'system-ui', 'sans-serif'],
        sans: ['Poppins', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        sm: '10px',
        md: '16px',
        lg: '24px',
      },
      borderWidth: {
        3: '3px',
      },
      boxShadow: {
        glass: '0 8px 32px -12px rgba(15, 23, 42, 0.14), 0 1px 3px rgba(15, 23, 42, 0.05)',
        'glass-hover': '0 18px 40px -16px rgba(15, 23, 42, 0.18), 0 4px 10px rgba(15, 23, 42, 0.06)',
        'glass-lg': '0 28px 60px -22px rgba(15, 23, 42, 0.22)',
        pop: '0 8px 32px -12px rgba(15, 23, 42, 0.14), 0 1px 3px rgba(15, 23, 42, 0.05)',
        'pop-lg': '0 28px 60px -22px rgba(15, 23, 42, 0.22)',
        'pop-pink': '0 18px 40px -16px rgba(249, 115, 22, 0.22)',
        'pop-sun': '0 18px 40px -16px rgba(245, 158, 11, 0.18)',
        'pop-mint': '0 18px 40px -16px rgba(5, 150, 105, 0.18)',
        'pop-soft': '0 8px 32px -12px rgba(15, 23, 42, 0.10)',
        'pop-accent': '0 12px 28px -10px rgba(79, 70, 229, 0.28)',
        'glow-emerald': '0 0 20px -3px rgba(5, 150, 105, 0.28)',
        'glow-amber': '0 0 20px -3px rgba(245, 158, 11, 0.28)',
        'glow-indigo': '0 0 24px -4px rgba(79, 70, 229, 0.28)',
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
        marquee: 'marquee 48s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.86)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '33%': { transform: 'rotate(2deg)' },
          '66%': { transform: 'rotate(-2deg)' },
        },
        marquee: {
          '0%': { transform: 'translate3d(0,0,0)' },
          '100%': { transform: 'translate3d(-50%,0,0)' },
        },
      }
    },
  },
  plugins: [],
}
