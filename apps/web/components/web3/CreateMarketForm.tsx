'use client'

// ═══════════════════════════════════════════════
// MIRAGE MARKET — Create Market Form
// Step-by-step form with live preview + tx submission
// ═══════════════════════════════════════════════

import { useState, useCallback, type ReactNode, type ChangeEvent } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther } from 'viem'
import { CONTRACT_ADDRESSES, SHADOW_MARKET_ABI, IDENTITY_GATE_ABI } from '@/lib/contracts'
import { MarketCard } from '@/components/ui/MarketCard'
import type { MarketCategory, TxStatus, Market } from '@/lib/types'

const CATEGORIES: MarketCategory[] = ['CRYPTO', 'MACRO', 'AI', 'SPORTS', 'PROTOCOL', 'OTHER']

export function CreateMarketForm(): ReactNode {
    const { address, isConnected } = useAccount()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState<MarketCategory>('CRYPTO')
    const [endDate, setEndDate] = useState('')
    const [minBet, setMinBet] = useState('0.01')
    const [txStatus, setTxStatus] = useState<TxStatus>('idle')
    const [txHash, setTxHash] = useState<`0x${string}` | null>(null)

    // Check if user is verified
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

    useWaitForTransactionReceipt({
        hash: txHash ?? undefined,
        query: {
            enabled: Boolean(txHash),
            onSuccess: () => setTxStatus('success'),
        } as Record<string, unknown>,
    })

    const handleSubmit = useCallback((): void => {
        if (!title || !description || !endDate || !address) return

        const endTime = BigInt(Math.floor(new Date(endDate).getTime() / 1000))
        const minBetWei = parseEther(minBet)

        let categoryId = 5 // OTHER
        if (category === 'CRYPTO') categoryId = 0
        else if (category === 'MACRO') categoryId = 1
        else if (category === 'AI') categoryId = 2
        else if (category === 'SPORTS') categoryId = 3
        else if (category === 'PROTOCOL') categoryId = 4

        writeContract({
            address: CONTRACT_ADDRESSES.shadowMarket,
            abi: SHADOW_MARKET_ABI,
            functionName: 'createMarket',
            args: [title, description, categoryId, endTime, minBetWei],
        })
    }, [title, description, category, endDate, minBet, address, writeContract])

    // Build preview market for live card preview
    const previewMarket: Market = {
        id: '0x0000000000000000000000000000000000000000000000000000000000000000',
        title: title || 'Your market question here...',
        description: description || 'Market description',
        category,
        endTime: endDate ? Math.floor(new Date(endDate).getTime() / 1000) : Math.floor(Date.now() / 1000) + 86400 * 30,
        minBet: minBet ? parseEther(minBet) : BigInt(1e16),
        yesOdds: 50,
        noOdds: 50,
        volume: BigInt(0),
        status: 'OPEN',
        outcome: null,
        isPrivate: true,
    }

    // Gates
    if (!isConnected) {
        return (
            <div className="border border-mirage-border p-8 bg-mirage-bg2 text-center">
                <span className="font-mono text-xs text-mirage-text-dimmer">
                    // connect wallet to create market
                </span>
            </div>
        )
    }

    if (!isVerified) {
        return (
            <div className="border border-mirage-border p-8 bg-mirage-bg2 text-center">
                <span className="font-mono text-xs text-mirage-text-dimmer">
                    // verify identity with World ID to create markets
                </span>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Form */}
            <div className="space-y-6">
                <span className="section-label text-[10px]">// MARKET DETAILS</span>

                {/* Title */}
                <div className="space-y-1">
                    <label className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider">
                        QUESTION *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                        placeholder="Will BTC exceed $200,000 by December 2025?"
                        className="w-full"
                        maxLength={200}
                    />
                    <span className="font-mono text-[10px] text-mirage-text-dimmer">
                        {title.length}/200
                    </span>
                </div>

                {/* Description */}
                <div className="space-y-1">
                    <label className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider">
                        RESOLUTION CRITERIA *
                    </label>
                    <textarea
                        value={description}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                        placeholder="Resolved based on CoinGecko BTC/USD OHLCV data at market close time."
                        className="w-full min-h-[80px] bg-mirage-bg border border-mirage-border text-mirage-text font-mono text-sm p-3 focus:border-mirage-border-bright outline-none resize-none"
                        maxLength={500}
                    />
                </div>

                {/* Category */}
                <div className="space-y-1">
                    <label className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider">
                        CATEGORY
                    </label>
                    <div className="flex flex-wrap gap-0">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-3 py-2 font-mono text-[10px] tracking-wider border border-mirage-border transition-all duration-200 ${category === cat
                                    ? 'bg-mirage-text text-mirage-bg border-mirage-text'
                                    : 'bg-transparent text-mirage-text-dim hover:border-mirage-border-bright'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* End Date */}
                <div className="space-y-1">
                    <label className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider">
                        END DATE *
                    </label>
                    <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full"
                    />
                </div>

                {/* Min Bet */}
                <div className="space-y-1">
                    <label className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider">
                        MINIMUM BET (ETH)
                    </label>
                    <input
                        type="number"
                        step="0.001"
                        min="0.001"
                        value={minBet}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setMinBet(e.target.value)}
                        className="w-full"
                    />
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={!title || !description || !endDate || txStatus === 'pending' || txStatus === 'mining'}
                    className="w-full py-3 font-mono text-xs tracking-wider border border-mirage-border hover:border-mirage-text hover:bg-mirage-text hover:text-mirage-bg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    {txStatus === 'idle' && '// create market'}
                    {txStatus === 'pending' && '// awaiting signature...'}
                    {txStatus === 'mining' && '// creating...'}
                    {txStatus === 'success' && '// market created ✓'}
                    {txStatus === 'error' && '// retry creation'}
                </button>

                {txHash && (
                    <div className="font-mono text-[10px] text-mirage-text-dimmer">
                        // tx: {txHash.slice(0, 10)}...{txHash.slice(-6)}{' '}
                        {txStatus === 'success' && '✓'}
                        {txStatus === 'mining' && '⏳'}
                    </div>
                )}
            </div>

            {/* Right: Live Preview */}
            <div className="space-y-4">
                <span className="section-label text-[10px]">// PREVIEW</span>
                <div className="sticky top-24">
                    <MarketCard market={previewMarket} />
                    <div className="mt-4 font-mono text-[10px] text-mirage-text-dimmer text-center">
                        ↑ live preview of your market card
                    </div>
                </div>
            </div>
        </div>
    )
}

// ✓ CreateMarketForm.tsx complete
