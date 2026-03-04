'use client'

// ═══════════════════════════════════════════════
// MIRAGE MARKET — Market Card
// Dithered dot pattern hover, probability bar, privacy tags
// ═══════════════════════════════════════════════

import { type ReactNode } from 'react'
import Link from 'next/link'
import type { Market } from '@/lib/types'

interface MarketCardProps {
    market: Market
}

/** Format ETH volume from wei bigint */
function formatVolume(wei: bigint): string {
    const eth = Number(wei) / 1e18
    if (eth >= 1000) return `${(eth / 1000).toFixed(1)}K ETH`
    if (eth >= 1) return `${eth.toFixed(2)} ETH`
    return `${eth.toFixed(4)} ETH`
}

/** Format remaining time */
function formatTimeLeft(endTime: number): string {
    const now = Math.floor(Date.now() / 1000)
    const remaining = endTime - now

    if (remaining <= 0) return 'Ended'
    if (remaining < 3600) return `${Math.floor(remaining / 60)}m left`
    if (remaining < 86400) return `${Math.floor(remaining / 3600)}h left`
    return `${Math.floor(remaining / 86400)}d left`
}

export function MarketCard({ market }: MarketCardProps): ReactNode {
    const isLive = market.status === 'OPEN'
    const isSettled = market.status === 'SETTLED'

    return (
        <Link href={`/markets/${market.id}`} className="block">
            <div className="dither-hover border border-mirage-border bg-mirage-bg2 p-5 transition-all duration-300 hover:border-mirage-border-bright group">
                {/* Header row: category + status */}
                <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[10px] tracking-wider uppercase text-mirage-text-dimmer">
                        {market.category}
                    </span>
                    <div className="flex items-center gap-2">
                        {isLive && (
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-mirage-green animate-pulse-dot" />
                                <span className="font-mono text-[10px] text-mirage-green tracking-wider">LIVE</span>
                            </div>
                        )}
                        {isSettled && (
                            <span className="font-mono text-[10px] text-mirage-text-dim tracking-wider">
                                SETTLED
                            </span>
                        )}
                        {market.status === 'CLOSED' && (
                            <span className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider">
                                CLOSED
                            </span>
                        )}
                    </div>
                </div>

                {/* Title */}
                <h3 className="font-mono text-sm text-mirage-text leading-relaxed mb-4 group-hover:text-white transition-colors">
                    {market.title}
                </h3>

                {/* Probability bar */}
                <div className="mb-4">
                    <div className="flex justify-between mb-1.5">
                        <span className="font-mono text-[10px] text-mirage-text-dim">YES {market.yesOdds}%</span>
                        <span className="font-mono text-[10px] text-mirage-text-dim">NO {market.noOdds}%</span>
                    </div>
                    <div className="w-full h-1 bg-mirage-border overflow-hidden">
                        <div
                            className="h-full bg-mirage-text transition-all duration-500"
                            style={{ width: `${market.yesOdds}%` }}
                        />
                    </div>
                </div>

                {/* Footer: volume + participants + privacy tag */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="font-mono text-[10px] text-mirage-text-dimmer">
                            VOL {formatVolume(market.volume)}
                        </span>
                        <span className="font-mono text-[10px] text-mirage-text-dimmer">
                            {formatTimeLeft(market.endTime)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-mirage-text-dimmer animate-pulse-dot">
                            ▓▓▓
                        </span>
                        <span className="font-mono text-[10px] text-mirage-text-dimmer">
                            encrypted
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}

// ✓ MarketCard.tsx complete
