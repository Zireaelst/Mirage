'use client'

// ═══════════════════════════════════════════════
// MIRAGE MARKET — useCommitPosition Hook
// Encapsulates commit-reveal logic as a reusable hook
// ═══════════════════════════════════════════════

import { useState, useCallback } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, keccak256, encodePacked } from 'viem'
import { CONTRACT_ADDRESSES, SHADOW_MARKET_ABI } from '@/lib/contracts'
import type { StoredCommitment, TxStatus } from '@/lib/types'

interface UseCommitPositionReturn {
    status: TxStatus
    txHash: `0x${string}` | null
    commit: (marketId: `0x${string}`, choice: boolean, amountEth: string) => void
    reset: () => void
}

function generateSalt(): `0x${string}` {
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    return `0x${Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')}` as `0x${string}`
}

function storeCommitment(commitment: StoredCommitment): void {
    const key = `mirage_commitment_${commitment.marketId}`
    localStorage.setItem(key, JSON.stringify(commitment))
}

export function useCommitPosition(): UseCommitPositionReturn {
    const [status, setStatus] = useState<TxStatus>('idle')
    const [txHash, setTxHash] = useState<`0x${string}` | null>(null)

    const { writeContract } = useWriteContract({
        mutation: {
            onMutate: () => setStatus('pending'),
            onSuccess: (hash) => {
                setTxHash(hash)
                setStatus('mining')
            },
            onError: () => setStatus('error'),
        },
    })

    useWaitForTransactionReceipt({
        hash: txHash ?? undefined,
        query: {
            enabled: Boolean(txHash),
            onSuccess: () => setStatus('success'),
        } as Record<string, unknown>,
    })

    const commit = useCallback(
        (marketId: `0x${string}`, choice: boolean, amountEth: string): void => {
            const amountWei = parseEther(amountEth)
            const salt = generateSalt()

            // Compute commitment: keccak256(encodePacked(choice, amount, salt))
            const commitment = keccak256(
                encodePacked(['bool', 'uint256', 'bytes32'], [choice, amountWei, salt])
            )

            // Store preimage locally for reveal phase
            storeCommitment({
                marketId,
                salt,
                choice,
                amount: amountWei.toString(),
                timestamp: Date.now(),
            })

            writeContract({
                address: CONTRACT_ADDRESSES.shadowMarket,
                abi: SHADOW_MARKET_ABI,
                functionName: 'commitPosition',
                args: [marketId, commitment],
                value: amountWei,
            })
        },
        [writeContract]
    )

    const reset = useCallback((): void => {
        setStatus('idle')
        setTxHash(null)
    }, [])

    return { status, txHash, commit, reset }
}

// ✓ useCommitPosition.ts complete
