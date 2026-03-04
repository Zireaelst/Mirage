// ═══════════════════════════════════════════════
// MIRAGE MARKET — World ID Proof Verification
// POST: Verify proof via World ID API v4
// ═══════════════════════════════════════════════

import { NextResponse } from 'next/server'

interface VerifyRequestBody {
    rp_id?: string
    proof?: {
        merkle_root: string
        nullifier_hash: string
        proof: string
        verification_level: string
    }
}

/**
 * POST /api/world-id/verify
 *
 * Forwards the IDKit verification result to the World ID API for server-side verification.
 * On success, fires a request to the CRE identity workflow (non-blocking).
 *
 * Input:  { rp_id: string, proof: WorldIDProof }
 * Output: { verified: boolean, nullifierHash: string }
 */
export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body = (await request.json()) as VerifyRequestBody

        if (!body.rp_id || !body.proof) {
            return NextResponse.json(
                { error: 'Missing required fields: rp_id, proof' },
                { status: 400 }
            )
        }

        const { proof } = body
        const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID

        if (!appId) {
            console.error('[world-id/verify] NEXT_PUBLIC_WORLD_APP_ID not configured')
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            )
        }

        // Forward proof to World ID verification API v4
        const verifyResponse = await fetch(
            `https://developer.worldcoin.org/api/v2/verify/${appId}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merkle_root: proof.merkle_root,
                    nullifier_hash: proof.nullifier_hash,
                    proof: proof.proof,
                    action: 'verify-mirage-human',
                    signal_hash: '',
                }),
            }
        )

        if (!verifyResponse.ok) {
            const errorText = await verifyResponse.text()
            console.error('[world-id/verify] World ID API error:', errorText)
            return NextResponse.json(
                { error: 'Verification failed', verified: false },
                { status: 400 }
            )
        }

        // Log nullifier hash for audit (NEVER log the full proof)
        console.log('[world-id/verify] Verified nullifier:', proof.nullifier_hash)

        // Fire-and-forget: trigger CRE identity workflow
        // This will write the verification onchain via the IdentityGate contract
        const creEndpoint = process.env.CRE_IDENTITY_WORKFLOW_URL
        if (creEndpoint) {
            fetch(creEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nullifier_hash: proof.nullifier_hash,
                    merkle_root: proof.merkle_root,
                    proof: proof.proof,
                    verification_level: proof.verification_level,
                }),
            }).catch((err) => {
                // Non-blocking — don't fail the response if CRE is unreachable
                console.error('[world-id/verify] CRE trigger failed (non-blocking):', err)
            })
        }

        return NextResponse.json({
            verified: true,
            nullifierHash: proof.nullifier_hash,
        })
    } catch (error) {
        console.error('[world-id/verify] Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// ✓ verify/route.ts complete
