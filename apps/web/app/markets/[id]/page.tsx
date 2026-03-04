'use client'

// ═══════════════════════════════════════════════
// MIRAGE MARKET — Single Market Page
// Market details + WorldID gate + CommitPosition
// ═══════════════════════════════════════════════

import { useState, useCallback, type ReactNode } from 'react'
import { useParams } from 'next/navigation'
import { WorldIDButton } from '@/components/web3/WorldIDButton'
import { CommitPosition } from '@/components/web3/CommitPosition'
import type { Market } from '@/lib/types'

// Demo market lookup — replace with onchain fetch
const DEMO_MARKETS: Record<string, Market> = {
    '0x0000000000000000000000000000000000000000000000000000000000000001': {
        id: '0x0000000000000000000000000000000000000000000000000000000000000001',
        title: 'Will BTC exceed $150,000 by March 2025?',
        description:
            'This market resolves YES if Bitcoin (BTC) price on CoinGecko exceeds $150,000 USD at any point before March 31, 2025 23:59 UTC. Resolution source: CoinGecko OHLCV API via Chainlink CRE Confidential HTTP.',
        category: 'CRYPTO',
        endTime: Math.floor(Date.now() / 1000) + 86400 * 30,
        minBet: BigInt(1e16),
        yesOdds: 68,
        noOdds: 32,
        volume: BigInt(42e18),
        status: 'OPEN',
        outcome: null,
        isPrivate: true,
    },
    '0x0000000000000000000000000000000000000000000000000000000000000002': {
        id: '0x0000000000000000000000000000000000000000000000000000000000000002',
        title: 'Will the Fed cut rates in Q2 2025?',
        description:
            'Resolves YES if the Federal Reserve announces a rate cut at any FOMC meeting during April–June 2025. Resolution source: FRED API via Chainlink CRE.',
        category: 'MACRO',
        endTime: Math.floor(Date.now() / 1000) + 86400 * 60,
        minBet: BigInt(5e15),
        yesOdds: 55,
        noOdds: 45,
        volume: BigInt(18e18),
        status: 'OPEN',
        outcome: null,
        isPrivate: true,
    },
    '0x0000000000000000000000000000000000000000000000000000000000000003': {
        id: '0x0000000000000000000000000000000000000000000000000000000000000003',
        title: 'Will GPT-5 be released before July 2025?',
        description:
            'Resolves YES if OpenAI publicly releases GPT-5 (or equivalent successor model) before July 1, 2025. Announcement must include public API access.',
        category: 'AI',
        endTime: Math.floor(Date.now() / 1000) + 86400 * 90,
        minBet: BigInt(1e16),
        yesOdds: 42,
        noOdds: 58,
        volume: BigInt(27e18),
        status: 'OPEN',
        outcome: null,
        isPrivate: true,
    },
}

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

    const market = DEMO_MARKETS[marketId]

    if (!market) {
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
                            <div className="space-y-2">
                                <div className="font-mono text-xs text-mirage-text-dim">
                                    ▓ positions committed (amounts hidden)
                                </div>
                                <div className="font-mono text-[10px] text-mirage-text-dimmer">
                                    individual positions are not visible — privacy by design
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
