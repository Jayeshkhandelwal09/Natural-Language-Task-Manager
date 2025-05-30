import { type Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  darkMode: "class",
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: '#8b5cf6',    // Purple
        secondary: '#3b82f6',  // Blue
        dark: '#1e293b',       // Slate-800
        gray: '#64748b',       // Slate-500
        lightGray: '#94a3b8',  // Slate-400
        danger: '#ef4444',     // Red-500
        success: '#10b981',    // Green-500
        warning: '#f59e0b',    // Amber-500
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '20px',
        '2xl': '24px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 6px rgba(0,0,0,0.1)',
        lg: '0 10px 15px rgba(0,0,0,0.15)',
        glass: '0 8px 32px rgba(0,0,0,0.1)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
    require("tailwind-scrollbar"),
  ],
} satisfies Config; 