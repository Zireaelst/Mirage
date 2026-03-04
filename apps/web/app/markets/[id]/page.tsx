'use client'

// ═══════════════════════════════════════════════
// MIRAGE MARKET — Single Market Page
// Market details + WorldID gate + CommitPosition
// ═══════════════════════════════════════════════

import { useState, useCallback, type ReactNode } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { WorldIDButton } from '@/components/web3/WorldIDButton'
import { CommitPosition } from '@/components/web3/CommitPosition'
import type { Market, MarketCategory, MarketStatus } from '@/lib/types'
import { useReadContract } from 'wagmi'
import { CONTRACT_ADDRESSES, SHADOW_MARKET_ABI } from '@/lib/contracts'

function mapCategory(c: number): MarketCategory {
    switch (c) {
        case 0: return 'CRYPTO'
        case 1: return 'MACRO'
        case 2: return 'AI'
        case 3: return 'SPORTS'
        case 4: return 'PROTOCOL'
        default: return 'OTHER'
    }
}

function mapStatus(s: number): MarketStatus {
    switch (s) {
        case 0: return 'OPEN'
        case 1: return 'CLOSED'
        case 2: return 'SETTLED'
        default: return 'OPEN'
    }
}

// Removing DEMO_MARKETS to use onchain data

function formatCountdown(endTime: number): string {
    const now = Math.floor(Date.now() / 1000)
    const remaining = endTime - now

    if (remaining <= 0) return '00:00:00'

    const days = Math.floor(remaining / 86400)
    const hours = Math.floor((remaining % 86400) / 3600)
    const minutes = Math.floor((remaining % 3600) / 60)

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
}

function formatEth(wei: bigint): string {
    return `${(Number(wei) / 1e18).toFixed(2)} ETH`
}

export default function MarketDetailPage(): ReactNode {
    const params = useParams()
    const marketId = params.id as string
    const [isVerified, setIsVerified] = useState(false)

    const handleVerified = useCallback((nullifierHash: string): void => {
        console.log('User verified with nullifier:', nullifierHash)
        setIsVerified(true)
    }, [])

    const handlePositionSuccess = useCallback((): void => {
        console.log('Position committed successfully')
    }, [])

    const { data: rawMarket, isLoading } = useReadContract({
        address: CONTRACT_ADDRESSES.shadowMarket,
        abi: SHADOW_MARKET_ABI,
        functionName: 'getMarket',
        args: [marketId as `0x${string}`],
        query: { refetchInterval: 10000 }
    })

    const market: Market | null = rawMarket ? {
        id: rawMarket.id,
        title: rawMarket.title,
        description: rawMarket.description,
        category: mapCategory(rawMarket.category),
        endTime: Number(rawMarket.endTime),
        minBet: rawMarket.minBet,
        yesOdds: 50, // Default privacy odds
        noOdds: 50,
        volume: rawMarket.totalPool,
        status: mapStatus(rawMarket.status),
        outcome: rawMarket.outcomeSet ? rawMarket.outcome : null,
        isPrivate: true,
    } : null

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="font-mono text-sm text-mirage-text-dimmer animate-pulse">
                    // loading market data from sepolia...
                </div>
            </div>
        )
    }

    if (!market || market.id === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="border border-mirage-border p-16 text-center">
                    <pre className="font-mono text-xs text-mirage-text-dimmer">
                        {`╔═════════════════════════╗
║                         ║
║   MARKET NOT FOUND      ║
║                         ║
║   id: ${marketId.slice(0, 10)}...  ║
║                         ║
╚═════════════════════════╝`}
                    </pre>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-24">
            <div className="mx-auto max-w-7xl px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ═══ LEFT PANEL: Market Details ═══ */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="section-label text-[10px]">// MARKET</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-mirage-green animate-pulse-dot" />
                                    <span className="font-mono text-[10px] text-mirage-green tracking-wider">
                                        {market.status}
                                    </span>
                                </div>
                            </div>
                            <h1 className="font-mono text-xl md:text-2xl leading-relaxed">
                                {market.title}
                            </h1>
                            <div className="flex items-center gap-4 mt-3">
                                <span className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider">
                                    {market.category}
                                </span>
                                <span className="font-mono text-[10px] text-mirage-text-dimmer">│</span>
                                <span className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider">
                                    ID: {market.id.slice(0, 10)}...
                                </span>
                            </div>
                        </div>

                        {/* Probability bar */}
                        <div className="border border-mirage-border p-5 bg-mirage-bg2">
                            <div className="flex justify-between mb-3">
                                <div>
                                    <span className="font-mono text-2xl text-mirage-text">{market.yesOdds}%</span>
                                    <span className="font-mono text-xs text-mirage-text-dim ml-2">YES</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-mono text-xs text-mirage-text-dim mr-2">NO</span>
                                    <span className="font-mono text-2xl text-mirage-text-dim">{market.noOdds}%</span>
                                </div>
                            </div>
                            <div className="w-full h-2 bg-mirage-border overflow-hidden">
                                <div
                                    className="h-full bg-mirage-text transition-all duration-500"
                                    style={{ width: `${market.yesOdds}%` }}
                                />
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-mirage-border">
                            <div className="bg-mirage-bg p-4">
                                <div className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider mb-1">
                                    VOLUME
                                </div>
                                <div className="font-mono text-sm">{formatEth(market.volume)}</div>
                            </div>
                            <div className="bg-mirage-bg p-4">
                                <div className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider mb-1">
                                    MIN BET
                                </div>
                                <div className="font-mono text-sm">{formatEth(market.minBet)}</div>
                            </div>
                            <div className="bg-mirage-bg p-4">
                                <div className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider mb-1">
                                    ENDS IN
                                </div>
                                <div className="font-mono text-sm">{formatCountdown(market.endTime)}</div>
                            </div>
                            <div className="bg-mirage-bg p-4">
                                <div className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider mb-1">
                                    PRIVACY
                                </div>
                                <div className="font-mono text-sm">▓▓▓</div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="border border-mirage-border p-5 bg-mirage-bg2">
                            <span className="section-label text-[10px] mb-3 inline-block">// RESOLUTION CRITERIA</span>
                            <p className="font-sans text-sm text-mirage-text-dim leading-relaxed">
                                {market.description}
                            </p>
                        </div>

                        {/* Activity */}
                        <div className="border border-mirage-border p-5 bg-mirage-bg2">
                            <span className="section-label text-[10px] mb-3 inline-block">// ACTIVITY</span>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-mono text-xs text-mirage-text-dim">
                                        ▓ positions committed (amounts hidden)
                                    </span>
                                    <span className="font-mono text-[10px] text-mirage-text-dimmer">
                                        {rawMarket ? Number(rawMarket.commitCount) : 0} participants, positions encrypted
                                    </span>
                                </div>
                                <div className="h-px bg-mirage-border" />
                                <div className="font-mono text-[10px] text-mirage-text-dimmer">
                                    individual positions are not visible — privacy by design.
                                    aggregate volume is shown but individual amounts remain hidden.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══ RIGHT PANEL: Actions ═══ */}
                    <div className="space-y-4">
                        {/* World ID verification gate */}
                        <div className="border border-mirage-border p-5 bg-mirage-bg2 space-y-4">
                            <span className="section-label text-[10px]">// 00 IDENTITY</span>
                            <WorldIDButton onVerified={handleVerified} />
                        </div>

                        {/* Commit Position — requires verification */}
                        {isVerified ? (
                            <CommitPosition
                                marketId={market.id}
                                minBet={market.minBet}
                                onSuccess={handlePositionSuccess}
                            />
                        ) : (
                            <div className="border border-mirage-border p-5 bg-mirage-bg2">
                                <span className="section-label text-[10px] mb-3 inline-block">// 01 COMMIT POSITION</span>
                                <div className="py-8 text-center">
                                    <span className="font-mono text-xs text-mirage-text-dimmer">
                    // verify identity to place position
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Reveal & Claim link — shows for settled markets */}
                        {market.status === 'SETTLED' && (
                            <Link
                                href={`/markets/${market.id}/reveal`}
                                className="block border border-mirage-green/30 bg-mirage-green-dim p-5 text-center font-mono text-xs tracking-wider text-mirage-green hover:bg-mirage-green hover:text-mirage-bg transition-all duration-200"
                            >
                                // reveal & claim winnings →
                            </Link>
                        )}

                        {/* Protocol info */}
                        <div className="border border-mirage-border p-5 bg-mirage-bg2 space-y-3">
                            <span className="section-label text-[10px]">// PROTOCOL</span>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="font-mono text-[10px] text-mirage-text-dimmer">Settlement</span>
                                    <span className="font-mono text-[10px] text-mirage-text-dim">CRE AI</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-mono text-[10px] text-mirage-text-dimmer">Identity</span>
                                    <span className="font-mono text-[10px] text-mirage-text-dim">World ID</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-mono text-[10px] text-mirage-text-dimmer">Privacy</span>
                                    <span className="font-mono text-[10px] text-mirage-text-dim">Commit-Reveal</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-mono text-[10px] text-mirage-text-dimmer">Network</span>
                                    <span className="font-mono text-[10px] text-mirage-text-dim">Tenderly VTN</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ✓ markets/[id]/page.tsx complete
