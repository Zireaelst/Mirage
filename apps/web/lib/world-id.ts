// ═══════════════════════════════════════════════
// MIRAGE MARKET — World ID Helpers
// ═══════════════════════════════════════════════

import type { RPSignatureResponse, WorldIDProof } from './types'

/** World ID app configuration — safe to expose (public) */
export const WORLD_ID_CONFIG = {
    appId: process.env.NEXT_PUBLIC_WORLD_APP_ID ?? '',
    rpId: process.env.NEXT_PUBLIC_WORLD_RP_ID ?? '',
    action: 'verify-mirage-human',
} as const

/**
 * Fetch RP signature from server for legacy World ID proofs.
 * The signing key NEVER leaves the server.
 */
export async function fetchRPSignature(action: string): Promise<RPSignatureResponse> {
    const response = await fetch('/api/world-id/rp-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`RP signature failed: ${errorData.error ?? response.statusText}`)
    }

    return response.json() as Promise<RPSignatureResponse>
}

/**
 * Submit World ID proof to server for verification.
 * Server handles the actual API call to World ID — client never touches the proof verification endpoint directly.
 */
export async function verifyWorldIDProof(
    proof: WorldIDProof
): Promise<{ verified: boolean; nullifierHash: string }> {
    const response = await fetch('/api/world-id/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            rp_id: WORLD_ID_CONFIG.rpId,
            proof,
        }),
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Verification failed' }))
        throw new Error(`World ID verification failed: ${errorData.error ?? response.statusText}`)
    }

    return response.json() as Promise<{ verified: boolean; nullifierHash: string }>
}

/**
 * Check if a stored nullifier hash matches a given address.
 * Used client-side only for UI gating — real verification is onchain.
 */
export function getStoredVerification(): { nullifierHash: string; timestamp: number } | null {
    if (typeof window === 'undefined') return null

    const stored = localStorage.getItem('mirage_verification')
    if (!stored) return null

    try {
        return JSON.parse(stored) as { nullifierHash: string; timestamp: number }
    } catch {
        return null
    }
}

/** Store verification locally after successful World ID proof */
export function storeVerification(nullifierHash: string): void {
    if (typeof window === 'undefined') return

    localStorage.setItem(
        'mirage_verification',
        JSON.stringify({
            nullifierHash,
            timestamp: Date.now(),
        })
    )
}

// ✓ world-id.ts complete
