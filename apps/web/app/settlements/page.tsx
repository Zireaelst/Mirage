// ═══════════════════════════════════════════════
// MIRAGE MARKET — Settlements Feed
// List of settled markets with CRE workflow info
// ═══════════════════════════════════════════════

import type { ReactNode } from 'react'
import Link from 'next/link'
import type { SettlementRecord } from '@/lib/types'

// Demo settlements — replace with onchain data after deploy
const DEMO_SETTLEMENTS: SettlementRecord[] = [
    {
        marketId: '0x0000000000000000000000000000000000000000000000000000000000000001',
        marketTitle: 'Will BTC exceed $100,000 by January 2025?',
        outcome: true,
        settledAt: Date.now() / 1000 - 86400 * 3,
        proof: '0xc4f46c3b2e8d7a1f2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a',
        txHash: '0xabc123def456789abc123def456789abc123def456789abc123def456789abc1',
    },
    {
        marketId: '0x0000000000000000000000000000000000000000000000000000000000000005',
        marketTitle: 'Will Ethereum Shanghai upgrade ship by Q1 2025?',
        outcome: true,
        settledAt: Date.now() / 1000 - 86400 * 7,
        proof: '0xd5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5',
        txHash: '0xdef456789abc123def456789abc123def456789abc123def456789abc123def4',
    },
    {
        marketId: '0x0000000000000000000000000000000000000000000000000000000000000006',
        marketTitle: 'Will the US CPI be below 3% in January 2025?',
        outcome: false,
        settledAt: Date.now() / 1000 - 86400 * 12,
        proof: '0xe6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6',
        txHash: '0x789abc123def456789abc123def456789abc123def456789abc123def456789a',
    },
    {
        marketId: '0x0000000000000000000000000000000000000000000000000000000000000007',
        marketTitle: 'Will GPT-4.5 be announced before February 2025?',
        outcome: false,
        settledAt: Date.now() / 1000 - 86400 * 18,
        proof: '0xf7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7',
        txHash: '0x123def456789abc123def456789abc123def456789abc123def456789abc123d',
    },
]

function formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function formatTimeSince(timestamp: number): string {
    const seconds = Math.floor(Date.now() / 1000 - timestamp)
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
}

export default function SettlementsPage(): ReactNode {
    return (
        <div className="min-h-screen pt-24">
            <div className="mx-auto max-w-4xl px-6 py-12">
                {/* Header */}
                <div className="mb-8">
                    <span className="section-label">// SETTLEMENTS</span>
                    <h1 className="font-mono text-2xl text-mirage-text mt-4 mb-2">
                        Market Resolutions
                    </h1>
                    <p className="font-sans text-sm text-mirage-text-dim max-w-lg">
                        All markets are settled via Chainlink CRE workflows. Each resolution includes
                        an onchain attestation verified by the DON.
                    </p>
                </div>

                {/* Resolution methodology */}
                <div className="border border-mirage-border p-4 bg-mirage-bg2 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border border-mirage-green/30 bg-mirage-green-dim flex items-center justify-center">
                            <span className="text-mirage-green text-xs">✓</span>
                        </div>
                        <div>
                            <span className="font-mono text-xs text-mirage-text">
                                Verified by Chainlink DON
                            </span>
                            <span className="font-mono text-[10px] text-mirage-text-dimmer ml-3">
                                CRE Settlement Workflow → Confidential HTTP → Onchain Result
                            </span>
                        </div>
                    </div>
                </div>

                {/* Settlement list */}
                <div className="space-y-0">
                    {DEMO_SETTLEMENTS.map((settlement, index) => (
                        <div
                            key={settlement.marketId}
                            className="dither-hover border border-mirage-border bg-mirage-bg2 p-5 transition-all duration-300 hover:border-mirage-border-bright -mt-px first:mt-0"
                        >
                            {/* Header row */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-mirage-text-dimmer text-xs">
                                        #{String(index + 1).padStart(3, '0')}
                                    </span>
                                    <span className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider">
                                        {formatTimeSince(settlement.settledAt)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-mirage-green" />
                                    <span className="font-mono text-[10px] text-mirage-green tracking-wider">
                                        SETTLED
                                    </span>
                                </div>
                            </div>

                            {/* Market title */}
                            <Link href={`/markets/${settlement.marketId}`}>
                                <h3 className="font-mono text-sm text-mirage-text leading-relaxed mb-3 hover:text-white transition-colors">
                                    {settlement.marketTitle}
                                </h3>
                            </Link>

                            {/* Outcome + details */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-mirage-border pt-3">
                                <div>
                                    <span className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider block mb-1">
                                        OUTCOME
                                    </span>
                                    <span className={`font-mono text-xs ${settlement.outcome ? 'text-mirage-green' : 'text-mirage-text'}`}>
                                        {settlement.outcome ? 'YES ✓' : 'NO ✗'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider block mb-1">
                                        SETTLED AT
                                    </span>
                                    <span className="font-mono text-[10px] text-mirage-text-dim">
                                        {formatDate(settlement.settledAt)}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider block mb-1">
                                        TX HASH
                                    </span>
                                    {settlement.txHash ? (
                                        <a
                                            href={`https://dashboard.tenderly.co/tx/${settlement.txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-mono text-[10px] text-mirage-text-dim hover:text-mirage-text transition-colors"
                                        >
                                            {settlement.txHash.slice(0, 10)}...{settlement.txHash.slice(-6)} ↗
                                        </a>
                                    ) : (
                                        <span className="font-mono text-[10px] text-mirage-text-dimmer">
                                            pending...
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* CRE attestation proof */}
                            <div className="mt-3 pt-3 border-t border-mirage-border">
                                <span className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider">
                                    CRE PROOF: {settlement.proof.slice(0, 18)}...{settlement.proof.slice(-8)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer info */}
                <div className="mt-8 border border-mirage-border p-4 bg-mirage-bg2">
                    <p className="font-mono text-[10px] text-mirage-text-dimmer leading-relaxed">
                        ▓ all settlements are triggered by the CRE settlement workflow.
                        <br />
                        the workflow fetches data via Confidential HTTP — API keys never touch the chain.
                        <br />
                        DON consensus ensures deterministic, tamper-proof resolution.
                    </p>
                </div>
            </div>
        </div>
    )
}

// ✓ settlements/page.tsx complete
