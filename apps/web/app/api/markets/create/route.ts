// ═══════════════════════════════════════════════
// MIRAGE MARKET — Create Market API
// Server action for market creation validation
// ═══════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'

interface CreateMarketBody {
    title: string
    description: string
    category: string
    endTime: number
    minBet: string
}

/** Validate market creation fields server-side */
function validateMarket(body: CreateMarketBody): string | null {
    if (!body.title || body.title.length < 10) {
        return 'Title must be at least 10 characters'
    }
    if (body.title.length > 200) {
        return 'Title must be under 200 characters'
    }
    if (!body.description || body.description.length < 20) {
        return 'Description must be at least 20 characters'
    }
    if (!body.endTime || body.endTime < Date.now() / 1000) {
        return 'End time must be in the future'
    }
    // Max 6 months
    if (body.endTime > Date.now() / 1000 + 86400 * 180) {
        return 'End time cannot be more than 6 months from now'
    }
    if (!body.minBet || Number(body.minBet) <= 0) {
        return 'Minimum bet must be positive'
    }
    const validCategories = ['CRYPTO', 'MACRO', 'AI', 'SPORTS', 'PROTOCOL', 'OTHER']
    if (!validCategories.includes(body.category)) {
        return 'Invalid category'
    }
    return null
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = (await request.json()) as CreateMarketBody

        // Server-side validation
        const error = validateMarket(body)
        if (error) {
            return NextResponse.json(
                { success: false, error },
                { status: 400 }
            )
        }

        // In a full product, we'd also:
        // 1. Check WorldID verification status via contract read
        // 2. Run Tenderly tx simulation
        // 3. Optionally generate AI description via OpenAI
        // For MVP, we validate and return — the actual tx is signed client-side

        return NextResponse.json({
            success: true,
            data: {
                validated: true,
                title: body.title,
                description: body.description,
                category: body.category,
                endTime: body.endTime,
                minBet: body.minBet,
            },
        })
    } catch {
        return NextResponse.json(
            { success: false, error: 'Invalid request body' },
            { status: 400 }
        )
    }
}

// ✓ markets/create/route.ts complete
