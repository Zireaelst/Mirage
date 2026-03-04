'use client'

// ═══════════════════════════════════════════════
// MIRAGE MARKET — Dither Background
// Animated dithering dot pattern overlay
// ═══════════════════════════════════════════════

import { useEffect, useRef, type ReactNode } from 'react'

interface DitherBackgroundProps {
    className?: string
    opacity?: number
    dotSize?: number
    spacing?: number
}

export function DitherBackground({
    className = '',
    opacity = 0.15,
    dotSize = 1,
    spacing = 6,
}: DitherBackgroundProps): ReactNode {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animFrame: number

        const resize = (): void => {
            const dpr = window.devicePixelRatio || 1
            canvas.width = canvas.offsetWidth * dpr
            canvas.height = canvas.offsetHeight * dpr
            ctx.scale(dpr, dpr)
        }

        const draw = (time: number): void => {
            const w = canvas.offsetWidth
            const h = canvas.offsetHeight
            ctx.clearRect(0, 0, w, h)

            // Bayer-like ordered dithering pattern with time offset
            const phase = time * 0.0003
            for (let x = 0; x < w; x += spacing) {
                for (let y = 0; y < h; y += spacing) {
                    // Bayer 2x2 threshold
                    const bx = (Math.floor(x / spacing) % 2)
                    const by = (Math.floor(y / spacing) % 2)
                    const threshold = [0, 2, 3, 1][bx + by * 2]! / 4

                    // Animate with sine wave + distance from center
                    const cx = w / 2
                    const cy = h / 2
                    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / Math.max(w, h)
                    const wave = Math.sin(dist * 8 - phase) * 0.5 + 0.5

                    if (wave > threshold) {
                        ctx.fillStyle = `rgba(232, 232, 232, ${opacity * wave})`
                        ctx.fillRect(x, y, dotSize, dotSize)
                    }
                }
            }

            animFrame = requestAnimationFrame(draw)
        }

        resize()
        window.addEventListener('resize', resize)
        animFrame = requestAnimationFrame(draw)

        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(animFrame)
        }
    }, [opacity, dotSize, spacing])

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 pointer-events-none ${className}`}
            style={{ width: '100%', height: '100%' }}
        />
    )
}

// ✓ DitherBackground.tsx complete
