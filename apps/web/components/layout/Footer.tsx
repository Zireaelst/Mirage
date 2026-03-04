// ═══════════════════════════════════════════════
// MIRAGE MARKET — Footer
// ═══════════════════════════════════════════════

import type { ReactNode } from 'react'
import Link from 'next/link'

export function Footer(): ReactNode {
    return (
        <footer className="border-t border-mirage-border bg-mirage-bg">
            <div className="mx-auto max-w-7xl px-6 py-12">
                {/* Top section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-6 h-6 border border-mirage-border-bright flex items-center justify-center">
                                <span className="text-xs font-mono text-mirage-text-dim">◈</span>
                            </div>
                            <span className="font-mono text-sm tracking-widest uppercase">Mirage</span>
                        </div>
                        <p className="font-sans text-sm text-mirage-text-dim leading-relaxed max-w-sm">
                            Your Position. Invisible. Your Proof.
                            <br />
                            Sybil-resistant, privacy-preserving prediction markets.
                        </p>
                    </div>

                    {/* Protocol */}
                    <div>
                        <span className="section-label mb-4 inline-block text-[10px]">// Protocol</span>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/markets"
                                    className="font-mono text-xs text-mirage-text-dim hover:text-mirage-text transition-colors"
                                >
                                    Markets
                                </Link>
                            </li>
                            <li>
                                <span className="font-mono text-xs text-mirage-text-dimmer">
                                    Governance ↗
                                </span>
                            </li>
                            <li>
                                <span className="font-mono text-xs text-mirage-text-dimmer">
                                    Documentation ↗
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Built With */}
                    <div>
                        <span className="section-label mb-4 inline-block text-[10px]">// Built With</span>
                        <ul className="space-y-2">
                            <li>
                                <span className="font-mono text-xs text-mirage-text-dim">Chainlink CRE</span>
                            </li>
                            <li>
                                <span className="font-mono text-xs text-mirage-text-dim">World ID</span>
                            </li>
                            <li>
                                <span className="font-mono text-xs text-mirage-text-dim">Tenderly VTN</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-mirage-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <span className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider">
                        © 2025 MIRAGE PROTOCOL — ALL POSITIONS ENCRYPTED
                    </span>
                    <div className="flex items-center gap-6">
                        <span className="font-mono text-[10px] text-mirage-text-dimmer">
                            ▓▓▓ PRIVACY FIRST ▓▓▓
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

// ✓ Footer.tsx complete
