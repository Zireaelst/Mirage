// ═══════════════════════════════════════════════
// MIRAGE MARKET — Create Market Page
// Verified users can propose new prediction markets
// ═══════════════════════════════════════════════

import type { ReactNode } from 'react'
import Link from 'next/link'
import { CreateMarketForm } from '@/components/web3/CreateMarketForm'

export default function CreateMarketPage(): ReactNode {
    return (
        <div className="min-h-screen pt-24">
            <div className="mx-auto max-w-6xl px-6 py-12">
                {/* Breadcrumb */}
                <Link
                    href="/markets"
                    className="font-mono text-[10px] text-mirage-text-dim hover:text-mirage-text tracking-wider transition-colors"
                >
                    ← BACK TO MARKETS
                </Link>

                {/* Header */}
                <div className="mt-8 mb-12">
                    <span className="section-label">// CREATE MARKET</span>
                    <h1 className="font-mono text-2xl text-mirage-text mt-4 mb-2">
                        Propose a Prediction Market
                    </h1>
                    <p className="font-sans text-sm text-mirage-text-dim max-w-lg">
                        Create a new market for the community to predict on.
                        Markets require World ID verification to prevent spam.
                    </p>
                </div>

                {/* Form + Preview */}
                <CreateMarketForm />

                {/* Guidelines */}
                <div className="mt-16 border border-mirage-border p-6 bg-mirage-bg2">
                    <span className="section-label text-[10px]">// MARKET GUIDELINES</span>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <h3 className="font-mono text-xs text-mirage-text">Good Markets</h3>
                            <ul className="space-y-1">
                                <li className="font-mono text-[10px] text-mirage-text-dim">
                                    ✓ Clear, binary yes/no questions
                                </li>
                                <li className="font-mono text-[10px] text-mirage-text-dim">
                                    ✓ Verifiable with public data sources
                                </li>
                                <li className="font-mono text-[10px] text-mirage-text-dim">
                                    ✓ Specific timeframe and resolution criteria
                                </li>
                                <li className="font-mono text-[10px] text-mirage-text-dim">
                                    ✓ Relevant to crypto, macro, AI, or sports
                                </li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-mono text-xs text-mirage-text">Avoid</h3>
                            <ul className="space-y-1">
                                <li className="font-mono text-[10px] text-mirage-text-dim">
                                    ✗ Subjective or opinion-based questions
                                </li>
                                <li className="font-mono text-[10px] text-mirage-text-dim">
                                    ✗ No clear resolution source
                                </li>
                                <li className="font-mono text-[10px] text-mirage-text-dim">
                                    ✗ End dates too far in the future (6+ months)
                                </li>
                                <li className="font-mono text-[10px] text-mirage-text-dim">
                                    ✗ Duplicate existing active markets
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ✓ create/page.tsx complete
