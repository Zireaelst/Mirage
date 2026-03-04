// ═══════════════════════════════════════════════
// MIRAGE MARKET — RP Signature Generation
// POST: Generate World ID RP signature (server-only)
// ═══════════════════════════════════════════════

import { NextResponse } from 'next/server'

/**
 * POST /api/world-id/rp-signature
 *
 * Generates a relying party signature for World ID legacy proofs.
 * The RP_SIGNING_KEY is server-side only — NEVER exposed to the client.
 *
 * Input:  { action: string }
 * Output: { sig, nonce, created_at, expires_at }
 */
export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body = (await request.json()) as { action?: string }

        if (!body.action) {
            return NextResponse.json(
                { error: 'Missing required field: action' },
                { status: 400 }
            )
        }

        const signingKey = process.env.RP_SIGNING_KEY
        if (!signingKey) {
            console.error('[rp-signature] RP_SIGNING_KEY not configured')
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            )
        }

        // Generate nonce and timestamps
        const nonce = crypto.randomUUID()
        const now = new Date()
        const expiresAt = new Date(now.getTime() + 5 * 60 * 1000) // 5 minutes

        // In production, use @worldcoin/idkit/signing's signRequest
        // For MVP, we generate a simple HMAC-based signature
        // TODO: Replace with actual World ID RP signing when SDK is configured
        const encoder = new TextEncoder()
        const keyData = encoder.encode(signingKey)
        const message = encoder.encode(`${body.action}:${nonce}:${now.toISOString()}`)

        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        )

        const signature = await crypto.subtle.sign('HMAC', cryptoKey, message)
        const sig = Buffer.from(signature).toString('base64')

        return NextResponse.json({
            sig,
            nonce,
            created_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
        })
    } catch (error) {
        console.error('[rp-signature] Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// ✓ rp-signature/route.ts complete
