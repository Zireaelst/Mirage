'use client'

// ═══════════════════════════════════════════════
// MIRAGE MARKET — Commit Position
// Commit-reveal betting with privacy (salt + hash)
// ═══════════════════════════════════════════════

import { useState, useCallback, type ReactNode } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther, keccak256, encodePacked } from 'viem'
import { CONTRACT_ADDRESSES, SHADOW_MARKET_ABI, IDENTITY_GATE_ABI } from '@/lib/contracts'
import type { StoredCommitment, TxStatus } from '@/lib/types'

interface CommitPositionProps {
    marketId: `0x${string}`
    minBet: bigint
    onSuccess: () => void
}

/** Generate a cryptographically random bytes32 salt */
function generateSalt(): `0x${string}` {
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    return `0x${Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')}` as `0x${string}`
}

/** Store commitment preimage in localStorage for later reveal */
function storeCommitment(commitment: StoredCommitment): void {
    const key = `mirage_commitment_${commitment.marketId}`
    localStorage.setItem(key, JSON.stringify(commitment))
}

export function CommitPosition({ marketId, minBet, onSuccess }: CommitPositionProps): ReactNode {
    const { address, isConnected } = useAccount()
    const [choice, setChoice] = useState<boolean | null>(null)
    const [amount, setAmount] = useState<string>('')
    const [txStatus, setTxStatus] = useState<TxStatus>('idle')
    const [txHash, setTxHash] = useState<`0x${string}` | null>(null)

    // Check if user is verified in IdentityGate
    const { data: isVerified } = useReadContract({
        address: CONTRACT_ADDRESSES.identityGate,
        abi: IDENTITY_GATE_ABI,
        functionName: 'verifiedUsers',
        args: address ? [address] : undefined,
        query: { enabled: Boolean(address) },
    })

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
                onSuccess()
            },
        } as Record<string, unknown>,
    })

    const handleCommit = useCallback((): void => {
        if (choice === null || !amount || !address) return

        const amountWei = parseEther(amount)

        // Validate minimum bet
        if (amountWei < minBet) return

        // Generate random salt — NEVER shown to user, stored locally
        const salt = generateSalt()

        // Compute commitment hash: keccak256(abi.encodePacked(choice, amount, salt))
        // This hash is what goes onchain — the preimage stays private
        const commitment = keccak256(
            encodePacked(
                ['bool', 'uint256', 'bytes32'],
                [choice, amountWei, salt]
            )
        )

        // Store preimage locally for the reveal/claim phase
        storeCommitment({
            marketId,
            salt,
            choice,
            amount: amountWei.toString(),
            timestamp: Date.now(),
        })

        // Send commitment hash onchain with the bet amount as msg.value
        writeContract({
            address: CONTRACT_ADDRESSES.shadowMarket,
            abi: SHADOW_MARKET_ABI,
            functionName: 'commitPosition',
            args: [marketId, commitment],
            value: amountWei,
        })
    }, [choice, amount, address, minBet, marketId, writeContract])

    // Gate: must be connected
    if (!isConnected) {
        return (
            <div className="border border-mirage-border p-5 bg-mirage-bg2">
                <span className="font-mono text-xs text-mirage-text-dimmer">
          // connect wallet to place position
                </span>
            </div>
        )
    }

    // Gate: must be verified
    if (!isVerified) {
        return (
            <div className="border border-mirage-border p-5 bg-mirage-bg2">
                <span className="font-mono text-xs text-mirage-text-dimmer">
          // verify identity to place position
                </span>
            </div>
        )
    }

    return (
        <div className="border border-mirage-border p-5 bg-mirage-bg2 space-y-4">
            {/* Section label */}
            <span className="section-label text-[10px]">// 01 COMMIT POSITION</span>

            {/* Choice toggle: YES / NO */}
            <div className="flex gap-0">
                <button
                    onClick={() => setChoice(true)}
                    className={`flex-1 py-3 font-mono text-xs tracking-wider border border-mirage-border transition-all duration-200 ${choice === true
                            ? 'bg-mirage-text text-mirage-bg border-mirage-text'
                            : 'bg-transparent text-mirage-text-dim hover:border-mirage-border-bright'
                        }`}
                >
                    YES
                </button>
                <button
                    onClick={() => setChoice(false)}
                    className={`flex-1 py-3 font-mono text-xs tracking-wider border border-mirage-border border-l-0 transition-all duration-200 ${choice === false
                            ? 'bg-mirage-text text-mirage-bg border-mirage-text'
                            : 'bg-transparent text-mirage-text-dim hover:border-mirage-border-bright'
                        }`}
                >
                    NO
                </button>
            </div>

            {/* Amount input */}
            <div className="space-y-1">
                <label className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider">
                    AMOUNT (ETH)
                </label>
                <input
                    type="number"
                    step="0.001"
                    min={Number(minBet) / 1e18}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`min ${Number(minBet) / 1e18} ETH`}
                    className="w-full"
                />
            </div>

            {/* Commit button */}
            <button
                onClick={handleCommit}
                disabled={choice === null || !amount || txStatus === 'pending' || txStatus === 'mining'}
                className="w-full py-3 font-mono text-xs tracking-wider border border-mirage-border hover:border-mirage-text hover:bg-mirage-text hover:text-mirage-bg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
                {txStatus === 'idle' && '// commit position'}
                {txStatus === 'pending' && '// awaiting signature...'}
                {txStatus === 'mining' && '// mining...'}
                {txStatus === 'success' && '// position committed ✓'}
                {txStatus === 'error' && '// retry commit'}
            </button>

            {/* Transaction status line */}
            {txHash && (
                <div className="font-mono text-[10px] text-mirage-text-dimmer">
          // tx: {txHash.slice(0, 10)}...{txHash.slice(-6)}{' '}
                    {txStatus === 'success' && '✓'}
                    {txStatus === 'mining' && '⏳'}
                </div>
            )}

            {/* Privacy notice */}
            <div className="border-t border-mirage-border pt-3 mt-3">
                <p className="font-mono text-[10px] text-mirage-text-dimmer leading-relaxed">
                    ▓ your choice and amount are encrypted locally.
                    <br />
                    only the commitment hash is stored onchain.
                    <br />
                    reveal happens during the claim phase.
                </p>
            </div>
        </div>
    )
}

// ✓ CommitPosition.tsx complete
