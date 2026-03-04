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
// TRIGGER:  EVM Log on ShadowMarket.MarketClosed(bytes32 indexed marketId)
// FLOW:
//   1. Extract marketId from EVM log topics
//   2. EVMClient.readContract: fetch market details from ShadowMarket
//   3. ConfidentialHTTPClient: fetch outcome data from external API
//      - API key accessed via runtime.getSecret() — NEVER onchain
//   4. Deterministic resolution (NOT LLM — avoids non-determinism)
//   5. EVMClient.writeReport: submit settlement to SettlementReceiver
//
// CONSENSUS: Identical aggregation — all DON nodes must resolve
//            to the same outcome before writing onchain.
//            This is why we use DETERMINISTIC resolution, not LLM.
// ═══════════════════════════════════════════════

// --- TypeScript Interfaces ---

/** Market data from ShadowMarket.getMarket() */
interface MarketData {
    id: string
    title: string
    description: string
    endTime: bigint
    minBet: bigint
    commitCount: bigint
    totalPool: bigint
    status: number  // 0=OPEN, 1=CLOSED, 2=SETTLED
    outcome: boolean
    outcomeSet: boolean
    creator: string
}

/** API price response from CoinGecko */
interface PriceAPIResponse {
    [coinId: string]: {
        usd: number
        usd_24h_change: number
    }
}

/** Workflow configuration */
interface SettlementConfig {
    shadowMarketAddress: string
    settlementReceiverAddress: string
    chainName: string
    dataApiUrl: string
}

/** CRE runtime interface */
interface CRERuntime {
    log: (message: string, data?: Record<string, unknown>) => void
    getSecret: (key: string) => string
    httpClient: {
        fetch: (url: string, options?: RequestInit) => Promise<{
            status: number
            body: unknown
        }>
    }
    confidentialHttpClient: {
        fetch: (url: string, options?: RequestInit) => Promise<{
            status: number
            body: unknown
        }>
    }
    evmClient: {
        writeContract: (params: {
            contractAddress: string
            method: string
            args: unknown[]
            chainName: string
            abi: unknown[]
        }) => Promise<{ txHash: string }>
        readContract: (params: {
            contractAddress: string
            method: string
            args: unknown[]
            chainName: string
            abi: unknown[]
        }) => Promise<unknown>
    }
}

/** EVM Log trigger event */
interface EVMLogTriggerEvent {
    /** Raw log topics — topic[0] is event sig, topic[1] is indexed marketId */
    topics: string[]
    /** Raw log data (non-indexed params) */
    data: string
    /** Block number where the event was emitted */
    blockNumber: number
    /** Transaction hash that emitted the event */
    transactionHash: string
}

// --- Resolution Logic ---

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
 *
 * @param marketTitle The market question text
 * @param marketDescription Resolution criteria
 * @param apiData Raw API response data
 * @returns true for YES outcome, false for NO outcome
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
        // Try bitcoin, ethereum, etc. based on title keywords
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
    // For non-price markets, check if the description contains "yes"/"true" keywords
    // This is a simplified fallback — in production, use specific API endpoints
    const dataStr = JSON.stringify(apiData).toLowerCase()
    if (dataStr.includes('"yes"') || dataStr.includes('"true"') || dataStr.includes('"confirmed"')) {
        return true
    }

    // Default: NO outcome if we can't determine
    return false
}

// --- Workflow Implementation ---

/**
 * CRE AI Settlement Workflow
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
export async function handler(
    runtime: CRERuntime,
    trigger: EVMLogTriggerEvent,
    config: SettlementConfig
): Promise<{ marketId: string; outcome: boolean; txHash: string }> {
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

    // ── Step 2: Fetch market details from ShadowMarket ──
    runtime.log('Step 2: Reading market details from ShadowMarket')

    const marketRaw = await runtime.evmClient.readContract({
        contractAddress: config.shadowMarketAddress,
        method: 'getMarket',
        args: [marketId],
        chainName: config.chainName,
        abi: [
            {
                inputs: [{ name: 'marketId', type: 'bytes32' }],
                name: 'getMarket',
                outputs: [
                    {
                        components: [
                            { name: 'id', type: 'bytes32' },
                            { name: 'title', type: 'string' },
                            { name: 'description', type: 'string' },
                            { name: 'endTime', type: 'uint256' },
                            { name: 'minBet', type: 'uint256' },
                            { name: 'commitCount', type: 'uint256' },
                            { name: 'totalPool', type: 'uint256' },
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
        ],
    }) as MarketData

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

    // Determine which API endpoint to call based on market category
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
        // Crypto price markets → CoinGecko
        apiUrl = `${config.dataApiUrl}/api/v3/simple/price?ids=bitcoin,ethereum,chainlink,solana&vs_currencies=usd&include_24hr_change=true`
    } else {
        // General markets → generic data API
        apiUrl = `${config.dataApiUrl}/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`
    }

    const dataResponse = await runtime.confidentialHttpClient.fetch(apiUrl, {
        headers: {
            'x-cg-demo-api-key': apiKey,
            'Accept': 'application/json',
        },
    })

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

    const txResult = await runtime.evmClient.writeContract({
        contractAddress: config.settlementReceiverAddress,
        method: 'receiveSettlement',
        args: [
            marketId,
            outcome,
            new TextEncoder().encode(proofData),
        ],
        chainName: config.chainName,
        abi: [
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
        ],
    })

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

// ✓ settlement-workflow/main.ts complete
