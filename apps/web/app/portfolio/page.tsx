'use client'

// ═══════════════════════════════════════════════
// MIRAGE MARKET — Portfolio Dashboard
// User's positions from localStorage + onchain data
// ═══════════════════════════════════════════════

import { useState, useEffect, useMemo, type ReactNode } from 'react'
import { useAccount, useReadContracts } from 'wagmi'
import { PortfolioCard } from '@/components/ui/PortfolioCard'
import type { PortfolioPosition, PortfolioStats, StoredCommitment, MarketStatus } from '@/lib/types'
import { CONTRACT_ADDRESSES, SHADOW_MARKET_ABI } from '@/lib/contracts'

function mapStatus(s: number): MarketStatus {
    switch (s) {
        case 0: return 'OPEN'
        case 1: return 'CLOSED'
        case 2: return 'SETTLED'
        default: return 'OPEN'
    }
}

/** Scan localStorage for all mirage commitments */
function loadCommitmentsFromStorage(): StoredCommitment[] {
    if (typeof window === 'undefined') return []

    const commitments: StoredCommitment[] = []
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('mirage_commitment_')) {
            try {
                const raw = localStorage.getItem(key)
                if (raw) commitments.push(JSON.parse(raw) as StoredCommitment)
            } catch {
                // Skip malformed entries
            }
        }
    }
    return commitments
}

// Removed DEMO_POSITIONS

function computeStats(positions: PortfolioPosition[]): PortfolioStats {
    let totalCommitted = BigInt(0)
    let totalClaimed = BigInt(0)
    let winCount = 0
    let lossCount = 0
    let pendingCount = 0

    for (const pos of positions) {
        totalCommitted += BigInt(pos.amount)
        if (pos.payout) totalClaimed += BigInt(pos.payout)

        if (pos.status === 'claimed') winCount++
        else if (pos.status === 'lost') lossCount++
        else pendingCount++
    }

    return {
        totalCommitted,
        totalClaimed,
        totalPositions: positions.length,
        winCount,
        lossCount,
        pendingCount,
    }
}

type FilterType = 'all' | 'active' | 'settled' | 'claimed'

export default function PortfolioPage(): ReactNode {
    const { isConnected } = useAccount()
    const [stored, setStored] = useState<StoredCommitment[]>([])
    const [filter, setFilter] = useState<FilterType>('all')

    useEffect(() => {
        setStored(loadCommitmentsFromStorage())
    }, [])

    const contractCalls = useMemo(() => {
        return stored.map((sc) => ({
            address: CONTRACT_ADDRESSES.shadowMarket,
            abi: SHADOW_MARKET_ABI,
            functionName: 'getMarket',
            args: [sc.marketId as `0x${string}`],
        }))
    }, [stored])

    const { data: marketsData } = useReadContracts({
        contracts: contractCalls,
        query: { refetchInterval: 10000 }
    })

    const positions: PortfolioPosition[] = useMemo(() => {
        if (!marketsData) return []

        return stored.map((sc, i) => {
            const raw = marketsData[i]?.result as any

            return {
                marketId: sc.marketId,
                marketTitle: raw ? raw.title : `Market ${sc.marketId.slice(0, 10)}...`,
                category: 'OTHER',
                choice: sc.choice,
                amount: sc.amount,
                status: 'committed',
                marketStatus: raw ? mapStatus(raw.status) : 'OPEN',
                outcome: raw && raw.outcomeSet ? raw.outcome : null,
                committedAt: sc.timestamp,
            }
        })
    }, [stored, marketsData])

    const stats = computeStats(positions)

    const filteredPositions = positions.filter((pos) => {
        switch (filter) {
            case 'active': return pos.marketStatus === 'OPEN'
            case 'settled': return pos.marketStatus === 'SETTLED' && pos.status !== 'claimed'
            case 'claimed': return pos.status === 'claimed'
            default: return true
        }
    })

    const formatEth = (wei: bigint): string => {
        const eth = Number(wei) / 1e18
        return eth >= 1 ? `${eth.toFixed(4)}` : `${eth.toFixed(6)}`
    }

    if (!isConnected) {
        return (
            <div className="min-h-screen pt-24">
                <div className="mx-auto max-w-4xl px-6 py-24 text-center">
                    <span className="section-label">// PORTFOLIO</span>
                    <div className="mt-8 border border-mirage-border p-12 bg-mirage-bg2">
                        <div className="font-mono text-6xl text-mirage-text-dimmer mb-4">◈</div>
                        <span className="font-mono text-xs text-mirage-text-dimmer">
                            // connect wallet to view your positions
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-24">
            <div className="mx-auto max-w-5xl px-6 py-12">
                {/* Header */}
                <div className="mb-8">
                    <span className="section-label">// PORTFOLIO</span>
                    <h1 className="font-mono text-2xl text-mirage-text mt-4 mb-2">
                        Your Positions
                    </h1>
                    <p className="font-sans text-sm text-mirage-text-dim">
                        All data is stored locally — your positions are never exposed onchain.
                    </p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-mirage-border mb-8">
                    <div className="bg-mirage-bg p-4">
                        <div className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider mb-1">
                            TOTAL COMMITTED
                        </div>
                        <div className="font-mono text-lg text-mirage-text">
                            {formatEth(stats.totalCommitted)} ETH
                        </div>
                    </div>
                    <div className="bg-mirage-bg p-4">
                        <div className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider mb-1">
                            TOTAL CLAIMED
                        </div>
                        <div className="font-mono text-lg text-mirage-green">
                            {formatEth(stats.totalClaimed)} ETH
                        </div>
                    </div>
                    <div className="bg-mirage-bg p-4">
                        <div className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider mb-1">
                            WIN RATE
                        </div>
                        <div className="font-mono text-lg text-mirage-text">
                            {stats.totalPositions > 0
                                ? `${Math.round((stats.winCount / stats.totalPositions) * 100)}%`
                                : '—'}
                        </div>
                    </div>
                    <div className="bg-mirage-bg p-4">
                        <div className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider mb-1">
                            POSITIONS
                        </div>
                        <div className="font-mono text-lg text-mirage-text">
                            {stats.totalPositions}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-0 mb-6">
                    {(['all', 'active', 'settled', 'claimed'] as FilterType[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 font-mono text-[10px] tracking-wider uppercase border border-mirage-border transition-all duration-200 ${filter === f
                                ? 'bg-mirage-text text-mirage-bg border-mirage-text'
                                : 'bg-transparent text-mirage-text-dim hover:border-mirage-border-bright'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Positions grid */}
                {filteredPositions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredPositions.map((pos) => (
                            <PortfolioCard key={`${pos.marketId}-${pos.committedAt}`} position={pos} />
                        ))}
                    </div>
                ) : (
                    <div className="border border-mirage-border p-12 bg-mirage-bg2 text-center">
                        <div className="font-mono text-mirage-text-dimmer text-sm">
                            // no positions found
                        </div>
                    </div>
                )}

                {/* Privacy notice */}
                <div className="mt-8 border border-mirage-border p-4 bg-mirage-bg2">
                    <p className="font-mono text-[10px] text-mirage-text-dimmer leading-relaxed">
                        ▓ position data is stored in your browser&apos;s localStorage.
                        <br />
                        amounts and choices are never exposed onchain — only commitment hashes.
                        <br />
                        clearing your browser data will remove access to your positions.
                    </p>
                </div>
            </div>
        </div>
    )
}

// ✓ portfolio/page.tsx complete
