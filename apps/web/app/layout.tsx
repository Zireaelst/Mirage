// ═══════════════════════════════════════════════
// MIRAGE MARKET — Root Layout
// ═══════════════════════════════════════════════

import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Providers } from '@/components/Providers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
    title: 'Mirage Market',
    description: 'Your Position. Invisible. Your Proof. — Private Prediction Protocol on Ethereum.',
    keywords: ['prediction market', 'privacy', 'World ID', 'Chainlink CRE', 'Ethereum', 'zero knowledge'],
    openGraph: {
        title: 'Mirage Market',
        description: 'Sybil-resistant, privacy-preserving prediction markets.',
        type: 'website',
    },
}

export default function RootLayout({ children }: { children: ReactNode }): ReactNode {
    return (
        <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
            <body className="bg-mirage-bg text-mirage-text font-mono antialiased">
                <Providers>
                    <Navbar />
                    <main className="min-h-screen">{children}</main>
                    <Footer />
                </Providers>
            </body>
        </html>
    )
}

// ✓ layout.tsx complete
