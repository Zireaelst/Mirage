import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './app/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './lib/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                mirage: {
                    bg: '#0a0a0a',
                    bg2: '#111111',
                    surface: '#161616',
                    border: '#2a2a2a',
                    'border-bright': '#3d3d3d',
                    text: '#e8e8e8',
                    'text-dim': '#888888',
                    'text-dimmer': '#444444',
                    green: '#4ade80',
                    'green-dim': '#1a3d2b',
                },
            },
            fontFamily: {
                mono: ['var(--font-geist-mono)', 'monospace'],
                sans: ['var(--font-geist-sans)', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '0',
                none: '0',
                sm: '0',
                md: '0',
                lg: '0',
                xl: '0',
                '2xl': '0',
                '3xl': '0',
                full: '0',
            },
        },
    },
    plugins: [],
}

export default config
// ✓ tailwind.config.ts complete
