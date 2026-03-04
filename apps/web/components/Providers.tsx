'use client'

// ═══════════════════════════════════════════════
// MIRAGE MARKET — Client Providers
// Wraps Wagmi + React Query in a client component
// ═══════════════════════════════════════════════

import { type ReactNode, useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/wagmi'

interface ProvidersProps {
    children: ReactNode
}

export function Providers({ children }: ProvidersProps): ReactNode {
    // useState ensures QueryClient is created once per component lifecycle
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        refetchOnWindowFocus: false,
                    },
                },
            })
    )

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}

// ✓ Providers.tsx complete
