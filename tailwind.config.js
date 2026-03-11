module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Midnight Command — Dark surface system
        surface: {
          DEFAULT: '#181a20',
          base: '#0e1015',
          raised: '#1e2025',
          input: '#252830',
          border: '#2a2d35',
          hover: '#2f323b',
        },
        // Amber accent scale
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Text hierarchy
        ink: {
          100: '#f4f5f7',
          200: '#d1d5db',
          300: '#9ca3af',
          400: '#6b7280',
          500: '#4b5563',
          600: '#374151',
        },
        // Semantic
        fleet: {
          amber: '#f59e0b',
          emerald: '#10b981',
          red: '#ef4444',
          blue: '#60a5fa',
          violet: '#a78bfa',
          cyan: '#22d3ee',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"IBM Plex Sans"', 'sans-serif'],
        sans: ['"IBM Plex Sans"', '"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-left': 'slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-up': 'slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'glow-pulse': 'amberGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'count-up': 'countUp 1s ease-out forwards',
        'shimmer': 'shimmer 2.5s infinite',
      },
      keyframes: {
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'none', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'none', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        amberGlow: {
          '0%, 100%': { boxShadow: '0 0 8px 0 rgba(245, 158, 11, 0.15)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(245, 158, 11, 0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.4), 0 0 0 1px rgba(245,158,11,0.1)',
        'sidebar': '2px 0 12px rgba(0,0,0,0.3)',
        'topbar': '0 1px 4px rgba(0,0,0,0.3)',
        'amber-glow': '0 0 16px rgba(245, 158, 11, 0.15)',
        'amber-glow-lg': '0 0 32px rgba(245, 158, 11, 0.25)',
        'modal': '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        'input-focus': '0 0 0 3px rgba(245, 158, 11, 0.12)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
