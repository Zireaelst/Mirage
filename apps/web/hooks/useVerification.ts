'use client'

// ═══════════════════════════════════════════════
// MIRAGE MARKET — useVerification Hook
// Checks World ID verification status
// ═══════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { CONTRACT_ADDRESSES, IDENTITY_GATE_ABI } from '@/lib/contracts'
import { getStoredVerification, storeVerification } from '@/lib/world-id'

interface VerificationState {
    /** User has been verified via World ID (onchain check) */
    isVerified: boolean
    /** Locally stored nullifier hash */
    nullifierHash: string | null
    /** Whether the check is in progress */
    isLoading: boolean
    /** Mark user as verified after successful World ID flow */
    markVerified: (nullifierHash: string) => void
}

export function useVerification(): VerificationState {
    const { address } = useAccount()
    const [localVerified, setLocalVerified] = useState(false)
    const [localNullifier, setLocalNullifier] = useState<string | null>(null)

    // Check onchain verification status
    const { data: onchainVerified, isLoading } = useReadContract({
        address: CONTRACT_ADDRESSES.identityGate,
        abi: IDENTITY_GATE_ABI,
        functionName: 'verifiedUsers',
        args: address ? [address] : undefined,
        query: { enabled: Boolean(address) },
    })

    // Check localStorage on mount
    useEffect(() => {
        const stored = getStoredVerification()
        if (stored) {
            setLocalVerified(true)
            setLocalNullifier(stored.nullifierHash)
        }
    }, [])

    const markVerified = useCallback((nullifierHash: string): void => {
        storeVerification(nullifierHash)
        setLocalVerified(true)
        setLocalNullifier(nullifierHash)
    }, [])

    return {
        // Verified if either onchain or locally confirmed
        isVerified: Boolean(onchainVerified) || localVerified,
        nullifierHash: localNullifier,
        isLoading,
        markVerified,
    }
}

// ✓ useVerification.ts complete
