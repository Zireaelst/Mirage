'use client'

// ═══════════════════════════════════════════════
// MIRAGE MARKET — World ID Verification Button
// IDKit v4 with orbLegacy preset + RP signing
// ═══════════════════════════════════════════════

import { useState, useCallback, type ReactNode } from 'react'
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit'
import type { ISuccessResult } from '@worldcoin/idkit'
import { fetchRPSignature, verifyWorldIDProof, storeVerification } from '@/lib/world-id'

type VerifyState = 'idle' | 'signing' | 'verifying' | 'verified' | 'error'

interface WorldIDButtonProps {
    onVerified: (nullifierHash: string) => void
}

export function WorldIDButton({ onVerified }: WorldIDButtonProps): ReactNode {
    const [state, setState] = useState<VerifyState>('idle')
    const [error, setError] = useState<string | null>(null)

    const handleVerify = useCallback(
        async (result: ISuccessResult): Promise<void> => {
            setState('verifying')
            setError(null)

            try {
                const response = await verifyWorldIDProof({
                    merkle_root: result.merkle_root,
                    nullifier_hash: result.nullifier_hash,
                    proof: result.proof,
                    verification_level: 'orb',
                })

                if (response.verified) {
                    setState('verified')
                    storeVerification(response.nullifierHash)
                    onVerified(response.nullifierHash)
                } else {
                    setState('error')
                    setError('Verification rejected by server')
                }
            } catch (err) {
                setState('error')
                setError(err instanceof Error ? err.message : 'Verification failed')
            }
        },
        [onVerified]
    )

    if (state === 'verified') {
        return (
            <div className="border border-mirage-green/30 bg-mirage-green-dim px-4 py-3 flex items-center gap-3">
                <span className="text-mirage-green font-mono text-sm">✓</span>
                <span className="font-mono text-xs text-mirage-green tracking-wider">
                    VERIFIED HUMAN
                </span>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <IDKitWidget
                app_id={process.env.NEXT_PUBLIC_WORLD_APP_ID as `app_${string}`}
                action="verify-mirage-human"
                onSuccess={handleVerify}
                verification_level={VerificationLevel.Orb}
            >
                {({ open }: { open: () => void }) => (
                    <button
                        onClick={() => {
                            setError(null)
                            open()
                        }}
                        disabled={state === 'signing' || state === 'verifying'}
                        className="w-full font-mono text-xs tracking-wider px-4 py-3 border border-mirage-border hover:border-mirage-text hover:bg-mirage-text hover:text-mirage-bg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        {state === 'idle' && '// verify human'}
                        {state === 'signing' && '// generating signature...'}
                        {state === 'verifying' && '// verifying proof...'}
                        {state === 'error' && '// retry verification'}
                    </button>
                )}
            </IDKitWidget>

            {error && (
                <div className="font-mono text-[10px] text-[#ff4444] px-1">
          // error: {error}
                </div>
            )}
        </div>
    )
}

// ✓ WorldIDButton.tsx complete
