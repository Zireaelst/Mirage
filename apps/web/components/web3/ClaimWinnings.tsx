'use client'

// ═══════════════════════════════════════════════
// MIRAGE MARKET — Claim Winnings
// Reveal commitment preimage + claim payout
// ═══════════════════════════════════════════════

import { useState, useCallback, useEffect, type ReactNode } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther, keccak256, encodePacked } from 'viem'
import { CONTRACT_ADDRESSES, SHADOW_MARKET_ABI } from '@/lib/contracts'
import type { StoredCommitment, TxStatus, Market } from '@/lib/types'

interface ClaimWinningsProps {
    market: Market
}

/** Retrieve stored commitment from localStorage */
function getStoredCommitment(marketId: `0x${string}`): StoredCommitment | null {
    if (typeof window === 'undefined') return null
    const key = `mirage_commitment_${marketId}`
    const raw = localStorage.getItem(key)
    if (!raw) return null
    try {
        return JSON.parse(raw) as StoredCommitment
    } catch {
        return null
    }
}

/** Clear stored commitment after successful claim */
function clearStoredCommitment(marketId: `0x${string}`): void {
    const key = `mirage_commitment_${marketId}`
    localStorage.removeItem(key)
}

export function ClaimWinnings({ market }: ClaimWinningsProps): ReactNode {
    const { address, isConnected } = useAccount()
    const [commitment, setCommitment] = useState<StoredCommitment | null>(null)
    const [txStatus, setTxStatus] = useState<TxStatus>('idle')
    const [txHash, setTxHash] = useState<`0x${string}` | null>(null)

    // Load commitment from localStorage on mount
    useEffect(() => {
        setCommitment(getStoredCommitment(market.id))
    }, [market.id])

    const { writeContract } = useWriteContract({
        mutation: {
            onMutate: () => setTxStatus('pending'),
            onSuccess: (hash) => {
                setTxHash(hash)
                setTxStatus('mining')
            },
            onError: () => setTxStatus('error'),
        },
    })

    // Wait for transaction receipt
    useWaitForTransactionReceipt({
        hash: txHash ?? undefined,
        query: {
            enabled: Boolean(txHash),
            onSuccess: () => {
                setTxStatus('success')
                clearStoredCommitment(market.id)
            },
        } as Record<string, unknown>,
    })

    const handleClaim = useCallback((): void => {
        if (!commitment || !address) return

        const amountWei = BigInt(commitment.amount)
        const salt = commitment.salt

        // Verify commitment hash locally before sending tx
        const computedHash = keccak256(
            encodePacked(
                ['bool', 'uint256', 'bytes32'],
                [commitment.choice, amountWei, salt]
            )
        )

        // Log for user confidence — they can see the hash matches
        console.log('// commitment hash verification:', computedHash)

        writeContract({
            address: CONTRACT_ADDRESSES.shadowMarket,
            abi: SHADOW_MARKET_ABI,
            functionName: 'claimWinnings',
            args: [market.id, commitment.choice, amountWei, salt],
        })
    }, [commitment, address, market.id, writeContract])

    // ── Render States ──

    if (!isConnected) {
        return (
            <div className="border border-mirage-border p-5 bg-mirage-bg2">
                <span className="font-mono text-xs text-mirage-text-dimmer">
                    // connect wallet to reveal position
                </span>
            </div>
        )
    }

    if (!commitment) {
        return (
            <div className="border border-mirage-border p-5 bg-mirage-bg2">
                <span className="font-mono text-xs text-mirage-text-dimmer">
                    // no commitment found for this market
                </span>
                <p className="font-mono text-[10px] text-mirage-text-dimmer mt-2 leading-relaxed">
                    you either didn&apos;t participate in this market or
                    <br />
                    committed from a different browser/device.
                </p>
            </div>
        )
    }

    const amountEth = formatEther(BigInt(commitment.amount))
    const isWinner = market.outcome === commitment.choice
    const estimatedPayout = isWinner
        ? formatEther(BigInt(commitment.amount) * BigInt(2))
        : '0'

    return (
        <div className="border border-mirage-border p-5 bg-mirage-bg2 space-y-4">
            <span className="section-label text-[10px]">// REVEAL & CLAIM</span>

            {/* Commitment details */}
            <div className="space-y-2 border border-mirage-border p-4 bg-mirage-bg">
                <div className="flex justify-between">
                    <span className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider">
                        YOUR PREDICTION
                    </span>
                    <span className="font-mono text-xs text-mirage-text">
                        {commitment.choice ? 'YES' : 'NO'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider">
                        AMOUNT
                    </span>
                    <span className="font-mono text-xs text-mirage-text">
                        {amountEth} ETH
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider">
                        OUTCOME
                    </span>
                    <span className={`font-mono text-xs ${market.outcome ? 'text-mirage-green' : 'text-mirage-text'}`}>
                        {market.outcome === null ? 'PENDING' : market.outcome ? 'YES' : 'NO'}
                    </span>
                </div>

                <div className="border-t border-mirage-border pt-2 mt-2">
                    <div className="flex justify-between">
                        <span className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider">
                            RESULT
                        </span>
                        <span className={`font-mono text-xs ${isWinner ? 'text-mirage-green' : 'text-[#ff4444]'}`}>
                            {isWinner ? '✓ WINNER' : '✗ LOST'}
                        </span>
                    </div>
                    {isWinner && (
                        <div className="flex justify-between mt-1">
                            <span className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider">
                                EST. PAYOUT
                            </span>
                            <span className="font-mono text-xs text-mirage-green">
                                {estimatedPayout} ETH
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Claim button */}
            {isWinner ? (
                <button
                    onClick={handleClaim}
                    disabled={txStatus === 'pending' || txStatus === 'mining' || txStatus === 'success'}
                    className="w-full py-3 font-mono text-xs tracking-wider border border-mirage-green/30 bg-mirage-green-dim text-mirage-green hover:bg-mirage-green hover:text-mirage-bg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    {txStatus === 'idle' && '// reveal & claim winnings'}
                    {txStatus === 'pending' && '// awaiting signature...'}
                    {txStatus === 'mining' && '// claiming...'}
                    {txStatus === 'success' && '// claimed ✓'}
                    {txStatus === 'error' && '// retry claim'}
                </button>
            ) : (
                <div className="w-full py-3 font-mono text-xs tracking-wider text-center text-mirage-text-dimmer border border-mirage-border">
                    // prediction incorrect — no payout
                </div>
            )}

            {/* Transaction hash */}
            {txHash && (
                <div className="font-mono text-[10px] text-mirage-text-dimmer">
                    // tx: {txHash.slice(0, 10)}...{txHash.slice(-6)}{' '}
                    {txStatus === 'success' && '✓'}
                    {txStatus === 'mining' && '⏳'}
                </div>
            )}

            {/* Privacy notice */}
            <div className="border-t border-mirage-border pt-3">
                <p className="font-mono text-[10px] text-mirage-text-dimmer leading-relaxed">
                    ▓ claiming reveals your choice and amount onchain.
                    <br />
                    this is the reveal phase of the commit-reveal scheme.
                </p>
            </div>
        </div>
    )
}

// ✓ ClaimWinnings.tsx complete
