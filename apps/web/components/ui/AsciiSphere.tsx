'use client'

// ═══════════════════════════════════════════════
// MIRAGE MARKET — ASCII Dither Sphere
// Bayer 4x4 ordered dithering, sphere SDF, debris ring
// Rendered as <pre> with Geist Mono at 7.5px
// ═══════════════════════════════════════════════

import { useEffect, useRef, useCallback, type ReactNode } from 'react'

// Bayer 4x4 ordered dithering matrix (normalized 0-1)
const BAYER_4X4 = [
    [0 / 16, 8 / 16, 2 / 16, 10 / 16],
    [12 / 16, 4 / 16, 14 / 16, 6 / 16],
    [3 / 16, 11 / 16, 1 / 16, 9 / 16],
    [15 / 16, 7 / 16, 13 / 16, 5 / 16],
]

// ASCII luminance ramp — from dark to bright
const CHAR_RAMP = ' .·:;+*░▒▓█'

// Debris particles orbiting the sphere
interface Debris {
    angle: number
    height: number
    radius: number
    speed: number
    char: string
}

function generateDebris(count: number): Debris[] {
    const chars = '·:;+*'
    const debris: Debris[] = []
    for (let i = 0; i < count; i++) {
        debris.push({
            angle: Math.random() * Math.PI * 2,
            height: (Math.random() - 0.5) * 0.3,
            radius: 0.85 + Math.random() * 0.35,
            speed: 0.3 + Math.random() * 0.5,
            char: chars[Math.floor(Math.random() * chars.length)]!,
        })
    }
    return debris
}

// Rotate a 3D point around the Y axis
function rotateY(x: number, y: number, z: number, angle: number): [number, number, number] {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    return [x * cos + z * sin, y, -x * sin + z * cos]
}

// Rotate a 3D point around the X axis
function rotateX(x: number, y: number, z: number, angle: number): [number, number, number] {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    return [x, y * cos - z * sin, y * sin + z * cos]
}

interface AsciiSphereProps {
    className?: string
    width?: number
    height?: number
}

export function AsciiSphere({
    className = '',
    width = 80,
    height = 40,
}: AsciiSphereProps): ReactNode {
    const preRef = useRef<HTMLPreElement>(null)
    const debrisRef = useRef<Debris[]>(generateDebris(40))

    const render = useCallback(
        (time: number): void => {
            const pre = preRef.current
            if (!pre) return

            const debris = debrisRef.current
            const angleY = time * 0.0008
            const angleX = Math.sin(time * 0.0003) * 0.3

            // Light direction (normalized upper-right)
            const lightX = 0.6
            const lightY = -0.5
            const lightZ = 0.6

            const sphereRadius = 0.7
            const aspect = width / height * 0.5 // character aspect ratio correction

            // Pre-compute debris screen positions for this frame
            const debrisScreen: Map<string, string> = new Map()
            for (const d of debris) {
                const a = d.angle + time * 0.001 * d.speed
                let dx = Math.cos(a) * d.radius
                let dy = d.height
                let dz = Math.sin(a) * d.radius

                    // Rotate debris with sphere
                    ;[dx, dy, dz] = rotateY(dx, dy, dz, angleY)
                    ;[dx, dy, dz] = rotateX(dx, dy, dz, angleX)

                // Only draw debris in front of camera (z > 0 means visible from front)
                if (dz > -0.5) {
                    const sx = Math.round((dx / aspect + 1) * 0.5 * width)
                    const sy = Math.round((-dy + 1) * 0.5 * height)
                    if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
                        debrisScreen.set(`${sx},${sy}`, d.char)
                    }
                }
            }

            let output = ''

            for (let row = 0; row < height; row++) {
                for (let col = 0; col < width; col++) {
                    // Normalize to [-1, 1] with aspect correction
                    const nx = (col / width * 2 - 1) * aspect
                    const ny = -(row / height * 2 - 1)

                    // Distance from center in 2D
                    const dist2D = Math.sqrt(nx * nx + ny * ny)

                    if (dist2D <= sphereRadius) {
                        // Point is on the sphere — compute z from sphere equation
                        const nz = Math.sqrt(sphereRadius * sphereRadius - nx * nx - ny * ny)

                        // Normal = normalized position on sphere
                        const invR = 1 / sphereRadius
                        let normX = nx * invR
                        let normY = ny * invR
                        let normZ = nz * invR

                            // Rotate the normal for animation
                            ;[normX, normY, normZ] = rotateY(normX, normY, normZ, angleY)
                            ;[normX, normY, normZ] = rotateX(normX, normY, normZ, angleX)

                        // Lambertian diffuse lighting
                        const diffuse = Math.max(0, normX * lightX + normY * lightY + normZ * lightZ)

                        // Add ambient
                        const brightness = 0.1 + diffuse * 0.9

                        // Apply Bayer 4x4 dithering
                        const bx = col % 4
                        const by = row % 4
                        const threshold = BAYER_4X4[by]![bx]!
                        const dithered = brightness + (threshold - 0.5) * 0.25

                        // Map to character
                        const charIdx = Math.floor(Math.max(0, Math.min(1, dithered)) * (CHAR_RAMP.length - 1))
                        output += CHAR_RAMP[charIdx]
                    } else {
                        // Check debris
                        const key = `${col},${row}`
                        const debrisChar = debrisScreen.get(key)
                        if (debrisChar) {
                            output += debrisChar
                        } else {
                            output += ' '
                        }
                    }
                }
                output += '\n'
            }

            pre.textContent = output
        },
        [width, height]
    )

    useEffect(() => {
        let animFrame: number

        const animate = (time: number): void => {
            render(time)
            animFrame = requestAnimationFrame(animate)
        }

        animFrame = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(animFrame)
    }, [render])

    return (
        <pre
            ref={preRef}
            className={className}
            style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: '7.5px',
                lineHeight: 1,
                whiteSpace: 'pre',
                color: '#e8e8e8',
                overflow: 'hidden',
                userSelect: 'none',
            }}
        />
    )
}

// ✓ AsciiSphere.tsx complete
