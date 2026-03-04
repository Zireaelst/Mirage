'use client'

// ═══════════════════════════════════════════════
// MIRAGE MARKET — Portfolio Card
// Individual position display with privacy toggle
// ═══════════════════════════════════════════════

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import type { PortfolioPosition } from '@/lib/types'

interface PortfolioCardProps {
    position: PortfolioPosition
}

function formatEthFromWei(wei: string): string {
    const eth = Number(wei) / 1e18
    if (eth >= 1) return `${eth.toFixed(4)} ETH`
    return `${eth.toFixed(6)} ETH`
}

function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

const STATUS_LABELS: Record<PortfolioPosition['status'], { text: string; color: string }> = {
    committed: { text: 'COMMITTED', color: 'text-mirage-text-dim' },
    revealed: { text: 'REVEALED', color: 'text-mirage-text' },
    claimed: { text: 'CLAIMED ✓', color: 'text-mirage-green' },
    lost: { text: 'LOST', color: 'text-[#ff4444]' },
}

export function PortfolioCard({ position }: PortfolioCardProps): ReactNode {
    const [isBlurred, setIsBlurred] = useState(true)
    const statusInfo = STATUS_LABELS[position.status]

    return (
        <div className="dither-hover border border-mirage-border bg-mirage-bg2 p-5 transition-all duration-300 hover:border-mirage-border-bright">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] tracking-wider text-mirage-text-dimmer uppercase">
                        {position.category}
                    </span>
                    <span className={`font-mono text-[10px] tracking-wider ${statusInfo.color}`}>
                        {statusInfo.text}
                    </span>
                </div>
                {/* Privacy toggle */}
                <button
                    onClick={() => setIsBlurred(!isBlurred)}
                    className="font-mono text-[10px] text-mirage-text-dimmer hover:text-mirage-text-dim transition-colors border-none bg-transparent p-0"
                >
                    {isBlurred ? '◉ reveal' : '◎ hide'}
                </button>
            </div>

            {/* Market title */}
            <Link href={`/markets/${position.marketId}`}>
                <h3 className="font-mono text-xs text-mirage-text leading-relaxed mb-3 hover:text-white transition-colors">
                    {position.marketTitle}
                </h3>
            </Link>

            {/* Position details */}
            <div className="space-y-2 border-t border-mirage-border pt-3">
                <div className="flex justify-between">
                    <span className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider">
                        PREDICTION
                    </span>
                    <span className="font-mono text-xs text-mirage-text">
                        {position.choice ? 'YES' : 'NO'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider">
                        AMOUNT
                    </span>
                    <span className={`font-mono text-xs text-mirage-text ${isBlurred ? 'blur-sm select-none' : ''}`}>
                        {formatEthFromWei(position.amount)}
                    </span>
                </div>
                {position.payout && (
                    <div className="flex justify-between">
                        <span className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider">
                            PAYOUT
                        </span>
                        <span className={`font-mono text-xs text-mirage-green ${isBlurred ? 'blur-sm select-none' : ''}`}>
                            {formatEthFromWei(position.payout)}
                        </span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider">
                        COMMITTED
                    </span>
                    <span className="font-mono text-[10px] text-mirage-text-dim">
                        {formatDate(position.committedAt)}
                    </span>
                </div>
            </div>

            {/* Action link for claimable positions */}
            {position.status === 'committed' && position.marketStatus === 'SETTLED' && (
                <Link
                    href={`/markets/${position.marketId}/reveal`}
                    className="block mt-3 py-2 text-center font-mono text-[10px] tracking-wider text-mirage-green border border-mirage-green/30 hover:bg-mirage-green-dim transition-all duration-200"
                >
                    // reveal & claim →
                </Link>
            )}
        </div>
    )
}

// ✓ PortfolioCard.tsx complete
