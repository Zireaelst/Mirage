// ═══════════════════════════════════════════════
// MIRAGE MARKET — CRE AI Settlement Workflow
//
// PURPOSE: When a market closes (EVM Log trigger), fetch outcome
//          data via Confidential HTTP, resolve market, write onchain.
//
// TRACKS: Chainlink CRE & AI ($17k), Prediction Markets ($16k),
//         Privacy ($16k)
//
// This is the CORE of the hackathon demo.
//
// TRIGGER:  EVM Log on ShadowMarketV2.MarketClosed(bytes32 indexed marketId)
// FLOW:
//   1. Extract marketId from EVM log topics
//   2. EVMClient.readContract → fetch market details from ShadowMarketV2
//   3. ConfidentialHTTPClient → fetch outcome data from external API
//      - API key accessed via getSecret() — NEVER onchain
//   4. Deterministic resolution (NOT LLM — avoids non-determinism)
//   5. EVMClient.writeContract → submit settlement to SettlementReceiver
//
// CONSENSUS: Identical aggregation — all DON nodes must resolve
//            to the same outcome before writing onchain.
//            This is why we use DETERMINISTIC resolution, not LLM.
// ═══════════════════════════════════════════════

import {
    type CRERuntime,
    type EVMLogTriggerEvent,
    type ConfidentialHTTPResponse,
    type EVMReadResult,
    type EVMWriteResult,
} from '@chainlink/cre-sdk'

// ── Workflow Configuration (from workflow.yaml config:) ──

interface SettlementConfig {
    shadowMarketAddress: string
    settlementReceiverAddress: string
    chainName: string
    dataApiUrl: string
}

// ── API Response Types ──

interface PriceAPIResponse {
    [coinId: string]: {
        usd: number
        usd_24h_change: number
    }
}

// ── ShadowMarketV2 ABI Fragment (getMarket) ──

const GET_MARKET_ABI = [
    {
        inputs: [{ name: 'marketId', type: 'bytes32' }],
        name: 'getMarket',
        outputs: [
            {
                components: [
                    { name: 'id', type: 'bytes32' },
                    { name: 'title', type: 'string' },
                    { name: 'description', type: 'string' },
                    { name: 'category', type: 'uint8' },
                    { name: 'endTime', type: 'uint256' },
                    { name: 'minBet', type: 'uint256' },
                    { name: 'commitCount', type: 'uint256' },
                    { name: 'totalPool', type: 'uint256' },
                    { name: 'yesPool', type: 'uint256' },
                    { name: 'noPool', type: 'uint256' },
                    { name: 'status', type: 'uint8' },
                    { name: 'outcome', type: 'bool' },
                    { name: 'outcomeSet', type: 'bool' },
                    { name: 'creator', type: 'address' },
                ],
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
] as const

// ── SettlementReceiver ABI Fragment (receiveSettlement) ──

const RECEIVE_SETTLEMENT_ABI = [
    {
        inputs: [
            { name: 'marketId', type: 'bytes32' },
            { name: 'outcome', type: 'bool' },
            { name: 'proof', type: 'bytes' },
        ],
        name: 'receiveSettlement',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const

// ── Resolution Logic ──

/**
 * Deterministic outcome resolution.
 *
 * IMPORTANT: This function MUST be deterministic — all DON nodes
 * must produce the SAME result for the SAME inputs. This is why
 * we do NOT use an LLM here. LLMs are non-deterministic by nature
 * and would cause consensus failures.
 *
 * Resolution strategies:
 * 1. Price markets: Compare current price against threshold in title
 * 2. Binary events: Check if event occurred based on API data
 */
function resolveOutcome(
    marketTitle: string,
    marketDescription: string,
    apiData: unknown
): boolean {
    const titleLower = marketTitle.toLowerCase()

    // ── Strategy 1: Price threshold markets ──
    // Pattern: "Will X exceed/reach $Y by Z?"
    const priceMatch = titleLower.match(/(?:exceed|reach|above|over)\s*\$?([\d,]+(?:\.\d+)?)/)
    if (priceMatch) {
        const threshold = parseFloat(priceMatch[1]!.replace(/,/g, ''))
        const priceData = apiData as PriceAPIResponse

        // Find the relevant coin price
        let currentPrice = 0
        if (titleLower.includes('btc') || titleLower.includes('bitcoin')) {
            currentPrice = priceData['bitcoin']?.usd ?? 0
        } else if (titleLower.includes('eth') || titleLower.includes('ethereum')) {
            currentPrice = priceData['ethereum']?.usd ?? 0
        } else if (titleLower.includes('link') || titleLower.includes('chainlink')) {
            currentPrice = priceData['chainlink']?.usd ?? 0
        } else if (titleLower.includes('sol') || titleLower.includes('solana')) {
            currentPrice = priceData['solana']?.usd ?? 0
        }

        return currentPrice >= threshold
    }

    // ── Strategy 2: Ratio markets ──
    // Pattern: "ETH/BTC ratio above X"
    const ratioMatch = titleLower.match(/ratio\s+(?:above|over)\s+([\d.]+)/)
    if (ratioMatch) {
        const threshold = parseFloat(ratioMatch[1]!)
        const priceData = apiData as PriceAPIResponse
        const ethPrice = priceData['ethereum']?.usd ?? 0
        const btcPrice = priceData['bitcoin']?.usd ?? 1
        const ratio = ethPrice / btcPrice
        return ratio >= threshold
    }

    // ── Strategy 3: Binary keyword resolution ──
    const dataStr = JSON.stringify(apiData).toLowerCase()
    if (dataStr.includes('"yes"') || dataStr.includes('"true"') || dataStr.includes('"confirmed"')) {
        return true
    }

    // Default: NO outcome if we can't determine
    return false
}

// ── Main Handler (CRE SDK Pattern) ──

/**
 * CRE AI Settlement Workflow Handler
 *
 * Triggered when a market is closed (MarketClosed event).
 * Fetches real-world data via Confidential HTTP (API keys hidden),
 * resolves the market deterministically, and writes the settlement
 * onchain via the SettlementReceiver contract.
 *
 * Key privacy feature: The Confidential HTTP client ensures that
 * API keys used to fetch data NEVER appear onchain or in any
 * transaction. The DON nodes access secrets through the encrypted
 * CRE secrets store.
 */
export default function handler(
    runtime: CRERuntime,
    trigger: EVMLogTriggerEvent,
    config: SettlementConfig
) {
    // ── Step 1: Extract marketId from EVM log ──
    runtime.log('Step 1: Extracting marketId from MarketClosed event')

    // topic[0] = event signature hash
    // topic[1] = indexed marketId (bytes32)
    const marketId = trigger.topics[1]
    if (!marketId) {
        throw new Error('Invalid trigger: missing marketId in log topics')
    }

    runtime.log('Market closed', {
        marketId,
        blockNumber: trigger.blockNumber,
        txHash: trigger.transactionHash,
    })

    // ── Step 2: Fetch market details from ShadowMarketV2 ──
    // Using CRE SDK EVMClient.readContract with .result() pattern
    runtime.log('Step 2: Reading market details from ShadowMarketV2')

    const marketRead = runtime.evmClient.readContract({
        contractAddress: config.shadowMarketAddress,
        method: 'getMarket',
        args: [marketId],
        chainName: config.chainName,
        abi: GET_MARKET_ABI,
    })

    // .result() blocks until the DON reads the contract
    const marketRaw = marketRead.result() as {
        id: string
        title: string
        description: string
        category: number
        endTime: bigint
        minBet: bigint
        commitCount: bigint
        totalPool: bigint
        status: number
        outcome: boolean
        outcomeSet: boolean
        creator: string
    }

    runtime.log('Market details', {
        title: marketRaw.title,
        commitCount: marketRaw.commitCount.toString(),
        totalPool: marketRaw.totalPool.toString(),
    })

    // ── Step 3: Fetch outcome data via Confidential HTTP ──
    // The ConfidentialHTTPClient ensures API keys are NEVER onchain.
    // Each DON node decrypts the secret locally, makes the API call,
    // and only the response is included in consensus.
    runtime.log('Step 3: Fetching outcome data via Confidential HTTP')

    // Get API key from CRE encrypted secrets store
    const apiKey = runtime.getSecret('DATA_API_KEY')

    // Determine which API endpoint to call based on market title
    const titleLower = marketRaw.title.toLowerCase()
    let apiUrl: string

    if (
        titleLower.includes('btc') ||
        titleLower.includes('eth') ||
        titleLower.includes('bitcoin') ||
        titleLower.includes('ethereum') ||
        titleLower.includes('chainlink') ||
        titleLower.includes('sol')
    ) {
        // Crypto price markets → CoinGecko Simple Price API
        apiUrl = `${config.dataApiUrl}/api/v3/simple/price?ids=bitcoin,ethereum,chainlink,solana&vs_currencies=usd&include_24hr_change=true`
    } else {
        // General markets → generic data API fallback
        apiUrl = `${config.dataApiUrl}/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`
    }

    const dataFetch = runtime.confidentialHttpClient.fetch(apiUrl, {
        headers: {
            'x-cg-demo-api-key': apiKey,
            'Accept': 'application/json',
        },
    })

    // .result() blocks until data is fetched via Confidential HTTP
    const dataResponse = dataFetch.result()

    if (dataResponse.status !== 200) {
        runtime.log('Data API error', { status: dataResponse.status })
        throw new Error(`Data API returned status ${dataResponse.status}`)
    }

    runtime.log('Step 3: Data fetched successfully ✓')

    // ── Step 4: Deterministic resolution ──
    // CRITICAL: This MUST be deterministic for DON consensus.
    // All nodes must compute the SAME outcome from the SAME data.
    // Using pattern matching and numerical comparison — NOT LLM.
    runtime.log('Step 4: Resolving outcome deterministically')

    const outcome = resolveOutcome(
        marketRaw.title,
        marketRaw.description,
        dataResponse.body
    )

    runtime.log('Resolution result', {
        outcome,
        title: marketRaw.title,
    })

    // ── Step 5: Write settlement to SettlementReceiver onchain ──
    // The CRE forwarder pattern ensures the settlement is submitted
    // from a trusted address that the SettlementReceiver recognizes.
    runtime.log('Step 5: Writing settlement to SettlementReceiver onchain')

    // Encode proof data (attestation of resolution)
    const proofData = JSON.stringify({
        source: 'coingecko',
        timestamp: Date.now(),
        apiData: dataResponse.body,
        resolution: outcome ? 'YES' : 'NO',
    })

    const txWrite = runtime.evmClient.writeContract({
        contractAddress: config.settlementReceiverAddress,
        method: 'receiveSettlement',
        args: [
            marketId,
            outcome,
            new TextEncoder().encode(proofData),
        ],
        chainName: config.chainName,
        abi: RECEIVE_SETTLEMENT_ABI,
    })

    // .result() blocks until the onchain write is confirmed
    const txResult = txWrite.result()

    runtime.log('Step 5: Settlement written onchain ✓', {
        txHash: txResult.txHash,
        marketId,
        outcome,
    })

    return {
        marketId,
        outcome,
        txHash: txResult.txHash,
    }
}

// ✓ settlement-workflow/main.ts — CRE SDK pattern
