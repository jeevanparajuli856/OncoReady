/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm paper ground — deliberately not the blue-white default.
        cream: '#F6F3ED',
        paper: '#FFFDF9',
        ink: '#17211E',
        muted: {
          DEFAULT: '#EDE8DF',
          fg: '#5A6560',
        },
        // Deep pine carries the brand; it is the dominant colour, not an accent dab.
        accent: {
          DEFAULT: '#0C3C34',
          fg: '#FFFDF9',
        },
        // Ember: reserved for at-risk / needs-a-human.
        pop: '#D6451B',
        // Ochre: aging, due soon.
        sun: '#B4740A',
        // Confirmed, closed, healthy.
        mint: '#2F7D6A',
        line: '#DFD8CC',
        brand: {
          50: '#EFF4F1',
          100: '#DCE8E3',
          500: '#0C3C34',
          600: '#0A322B',
          700: '#082721',
          800: '#061C18',
          900: '#041310',
        },
        clinical: {
          teal: '#0C3C34',
          cyan: '#2F7D6A',
          amber: '#B4740A',
          emerald: '#2F7D6A',
          rose: '#B3341A',
        },
        // Partner marks, used only on integration surfaces.
        partner: {
          uber: '#000000',
          lyft: '#EA0B8C',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        heading: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'SF Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '14px',
      },
      borderWidth: {
        3: '3px',
      },
      boxShadow: {
        glass: '0 1px 2px rgba(23, 33, 30, 0.05), 0 8px 24px -16px rgba(23, 33, 30, 0.22)',
        'glass-hover': '0 2px 4px rgba(23, 33, 30, 0.06), 0 16px 34px -18px rgba(23, 33, 30, 0.28)',
        'glass-lg': '0 24px 56px -28px rgba(23, 33, 30, 0.32)',
        pop: '0 1px 2px rgba(23, 33, 30, 0.05), 0 8px 24px -16px rgba(23, 33, 30, 0.22)',
        'pop-lg': '0 24px 56px -28px rgba(23, 33, 30, 0.32)',
        'pop-pink': '0 14px 32px -18px rgba(214, 69, 27, 0.35)',
        'pop-sun': '0 14px 32px -18px rgba(180, 116, 10, 0.32)',
        'pop-mint': '0 14px 32px -18px rgba(47, 125, 106, 0.32)',
        'pop-soft': '0 1px 2px rgba(23, 33, 30, 0.04), 0 6px 18px -14px rgba(23, 33, 30, 0.2)',
        'pop-accent': '0 14px 32px -18px rgba(12, 60, 52, 0.45)',
        'glow-emerald': '0 0 0 3px rgba(47, 125, 106, 0.16)',
        'glow-amber': '0 0 0 3px rgba(180, 116, 10, 0.16)',
        'glow-indigo': '0 0 0 3px rgba(12, 60, 52, 0.16)',
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
