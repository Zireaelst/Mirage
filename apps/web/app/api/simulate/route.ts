// ═══════════════════════════════════════════════
// MIRAGE MARKET — Tenderly Transaction Simulation
// Simulate transactions before user signs
// ═══════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'

interface SimulateBody {
    from: string
    to: string
    data: string
    value?: string
}

interface TenderlySimResponse {
    simulation: {
        status: boolean
        gas_used: number
        error_message?: string
    }
    transaction: {
        status: boolean
        hash: string
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = (await request.json()) as SimulateBody

        if (!body.from || !body.to || !body.data) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: from, to, data' },
                { status: 400 }
            )
        }

        const tenderlyAccessKey = process.env.TENDERLY_ACCESS_KEY
        const tenderlyAccount = process.env.TENDERLY_ACCOUNT
        const tenderlyProject = process.env.TENDERLY_PROJECT

        // If Tenderly credentials are not set, return optimistic result
        if (!tenderlyAccessKey || !tenderlyAccount || !tenderlyProject) {
            console.warn('// Tenderly credentials not configured — skipping simulation')
            return NextResponse.json({
                success: true,
                data: {
                    success: true,
                    gasUsed: 0,
                    simulated: false,
                    message: 'Simulation skipped — Tenderly credentials not configured',
                },
            })
        }

        // Call Tenderly Simulation API
        const simulationUrl = `https://api.tenderly.co/api/v1/account/${tenderlyAccount}/project/${tenderlyProject}/simulate`

        const response = await fetch(simulationUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Key': tenderlyAccessKey,
            },
            body: JSON.stringify({
                save: false,
                save_if_fails: true,
                simulation_type: 'quick',
                network_id: '11155111', // Sepolia
                from: body.from,
                to: body.to,
                input: body.data,
                value: body.value ?? '0',
                gas: 8000000,
                gas_price: '0',
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('// Tenderly simulation failed:', errorText)
            return NextResponse.json({
                success: true,
                data: {
                    success: false,
                    gasUsed: 0,
                    error: 'Simulation request failed',
                    simulated: true,
                },
            })
        }

        const result = (await response.json()) as TenderlySimResponse

        return NextResponse.json({
            success: true,
            data: {
                success: result.simulation.status,
                gasUsed: result.simulation.gas_used,
                error: result.simulation.error_message ?? undefined,
                simulated: true,
            },
        })
    } catch {
        return NextResponse.json(
            { success: false, error: 'Internal simulation error' },
            { status: 500 }
        )
    }
}

// ✓ simulate/route.ts complete
