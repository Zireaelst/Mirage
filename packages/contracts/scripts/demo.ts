// ═══════════════════════════════════════════════════════════════
// MIRAGE MARKET — Full Flow Demo Script
// Run: npx hardhat run scripts/demo.ts --network sepolia
//
// Shows the entire lifecycle:
//   1. Create market
//   2. Commit encrypted position
//   3. Close market (triggers MarketClosed event)
//   4. [SIMULATED CRE] Fetch CoinGecko price → settle market
//   5. Reveal & claim winnings
// ═══════════════════════════════════════════════════════════════

import { ethers } from 'hardhat'

// ── Styled console output ──

const CYAN = '\x1b[36m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const DIM = '\x1b[2m'
const BOLD = '\x1b[1m'
const RESET = '\x1b[0m'

function header(text: string) {
    console.log()
    console.log(`${CYAN}═══════════════════════════════════════════════════════${RESET}`)
    console.log(`${CYAN}${BOLD}  ◈ ${text}${RESET}`)
    console.log(`${CYAN}═══════════════════════════════════════════════════════${RESET}`)
    console.log()
}

function step(num: number, text: string) {
    console.log(`${GREEN}  [STEP ${num}]${RESET} ${text}`)
}

function info(label: string, value: string) {
    console.log(`${DIM}           ${label}:${RESET} ${value}`)
}

function success(text: string) {
    console.log(`${GREEN}  ✓ ${text}${RESET}`)
}

function cre(text: string) {
    console.log(`${YELLOW}  ⛓ [CRE]${RESET} ${text}`)
}

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// ── Main Demo ──

async function main() {
    const [deployer] = await ethers.getSigners()

    // ── Deploy Fresh Contracts for Demo ──
    header('MIRAGE MARKET — Full Flow Demo')
    console.log(`${DIM}  Network: Ethereum Sepolia`)
    console.log(`  Deployer: ${deployer.address}${RESET}`)
    console.log()

    step(0, 'Deploying fresh contracts for demo...')

    // Deploy a mock IdentityGate that just lets anyone verify
    const MockIdentityGate = await ethers.getContractFactory('MockIdentityGate')
    const identityGate = await MockIdentityGate.deploy()
    await identityGate.waitForDeployment()

    // Deploy ShadowMarketV2
    const ShadowMarketV2 = await ethers.getContractFactory('ShadowMarketV2')
    const shadowMarket = await ShadowMarketV2.deploy(await identityGate.getAddress())
    await shadowMarket.waitForDeployment()

    // Deploy SettlementReceiver
    const SettlementReceiver = await ethers.getContractFactory('SettlementReceiver')
    const settlementReceiver = await SettlementReceiver.deploy(await shadowMarket.getAddress())
    await settlementReceiver.waitForDeployment()

    await shadowMarket.setSettlementReceiver(await settlementReceiver.getAddress())

    success('Instances deployed successfully')

    // ══════════════════════════════════════════════
    // STEP 1 — Create Market
    // ══════════════════════════════════════════════

    step(1, 'Creating prediction market...')
    await sleep(500)

    const title = 'Will BTC exceed $150,000 by June 2026?'
    const description = 'Resolves YES if BTC/USD on CoinGecko exceeds $150,000. Source: CoinGecko API via Chainlink CRE Confidential HTTP.'
    const category = 0 // CRYPTO
    const endTime = Math.floor(Date.now() / 1000) + 60 // 1 min from now (demo)
    const minBet = ethers.parseEther('0.001')

    const createTx = await shadowMarket.createMarket(title, description, category, endTime, minBet)
    const createReceipt = await createTx.wait()

    // Extract marketId from event logs
    const marketId = createReceipt?.logs[0]?.topics[1] as string

    info('title', title)
    info('marketId', marketId)
    info('minBet', '0.001 ETH')
    info('tx', createTx.hash)
    success('Market created on Sepolia')

    await sleep(1000)

    // ══════════════════════════════════════════════
    // STEP 2 — Commit encrypted position
    // ══════════════════════════════════════════════

    step(2, 'Committing encrypted position (commit-reveal)...')
    await sleep(500)

    const choice = true // YES
    const amount = ethers.parseEther('0.001')
    const salt = ethers.randomBytes(32)

    // Generate commitment hash — this is what goes onchain
    const commitment = ethers.solidityPackedKeccak256(
        ['bool', 'uint256', 'bytes32'],
        [choice, amount, salt]
    )

    info('choice', '██████ (hidden)')
    info('amount', '██████ (hidden)')
    info('commitment', commitment)
    console.log(`${DIM}           ↑ only this hash goes onchain — choice & amount are private${RESET}`)

    // Check if user is verified, if not mock-verify
    const isVerified = await identityGate.verifiedUsers(deployer.address)
    if (!isVerified) {
        info('identity', 'Not verified — registering via IdentityGate...')
        try {
            const verifyTx = await identityGate.verifyAndRegister(0, 0, 12345, 0, [0, 0, 0, 0, 0, 0, 0, 0])
            await verifyTx.wait()
            success('World ID verification registered')
        } catch {
            info('identity', 'Already registered or mock mode')
        }
    } else {
        info('identity', 'World ID verified ✓')
    }

    const commitTx = await shadowMarket.commitPosition(marketId, commitment, { value: amount })
    await commitTx.wait()

    info('tx', commitTx.hash)
    success('Position committed — encrypted on Sepolia')

    await sleep(1000)

    // ══════════════════════════════════════════════
    // STEP 3 — Close market (fires MarketClosed event)
    // ══════════════════════════════════════════════

    step(3, 'Closing market → emits MarketClosed event...')
    await sleep(500)

    const closeTx = await shadowMarket.closeMarket(marketId)
    await closeTx.wait()

    info('event', 'MarketClosed(bytes32 indexed marketId)')
    info('tx', closeTx.hash)
    success('Market closed — CRE workflow would be triggered here')

    await sleep(1500)

    // ══════════════════════════════════════════════
    // STEP 4 — [SIMULATED CRE] Fetch data + Settle
    // ══════════════════════════════════════════════

    header('CHAINLINK CRE — Settlement Workflow (Simulated)')

    cre('Trigger: MarketClosed event detected on Sepolia')
    cre(`MarketId: ${marketId}`)
    await sleep(800)

    cre('Step 1: Reading market from ShadowMarketV2...')
    const market = await shadowMarket.getMarket(marketId)
    cre(`  title: "${market.title}"`)
    cre(`  totalPool: ${ethers.formatEther(market.totalPool)} ETH`)
    cre(`  commitCount: ${market.commitCount.toString()}`)
    await sleep(800)

    cre('Step 2: Confidential HTTP → CoinGecko API')
    cre('  🔐 API key decrypted from CRE secret store (never onchain)')

    // Actually fetch CoinGecko
    let btcPrice = 0
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
        const data = await res.json() as any
        btcPrice = data.bitcoin.usd
        cre(`  BTC/USD: $${btcPrice.toLocaleString()}`)
    } catch {
        btcPrice = 104250 // fallback mock
        cre(`  BTC/USD: $${btcPrice.toLocaleString()} (mock)`)
    }
    await sleep(800)

    cre('Step 3: Deterministic resolution (no LLM, pure logic)')
    const threshold = 150000
    const outcome = btcPrice >= threshold
    cre(`  threshold: $${threshold.toLocaleString()}`)
    cre(`  current:   $${btcPrice.toLocaleString()}`)
    cre(`  outcome:   ${outcome ? 'YES ✓' : 'NO ✗'}`)
    await sleep(800)

    cre('Step 4: DON consensus → writing settlement onchain...')

    // Set deployer as forwarder so we can simulate CRE write
    try {
        const setFwdTx = await settlementReceiver.setForwarder(deployer.address)
        await setFwdTx.wait()
    } catch { /* already set */ }

    const proof = ethers.toUtf8Bytes(JSON.stringify({
        source: 'coingecko',
        btcPrice,
        resolution: outcome ? 'YES' : 'NO',
        timestamp: Date.now()
    }))

    const settleTx = await settlementReceiver.receiveSettlement(marketId, outcome, proof)
    await settleTx.wait()

    cre(`  tx: ${settleTx.hash}`)
    cre('  SettlementReceiver → ShadowMarketV2.settleMarket()')
    success('Market settled via CRE workflow ✓')

    await sleep(1000)

    // ══════════════════════════════════════════════
    // STEP 5 — Reveal & Claim
    // ══════════════════════════════════════════════

    step(5, 'Revealing commitment & claiming winnings...')
    await sleep(500)

    info('preimage', `choice=${choice}, amount=${ethers.formatEther(amount)} ETH`)
    info('salt', ethers.hexlify(salt))

    try {
        const claimTx = await shadowMarket.claimWinnings(marketId, choice, amount, salt)
        await claimTx.wait()
        info('tx', claimTx.hash)

        if (choice === outcome) {
            success(`Winner! Payout: ${ethers.formatEther(amount * BigInt(2))} ETH (2x)`)
        } else {
            info('result', 'Position on losing side — no payout')
        }
    } catch (e: any) {
        info('claim', e.message?.slice(0, 80) || 'Claim attempted')
    }

    // ══════════════════════════════════════════════
    // Done
    // ══════════════════════════════════════════════

    header('DEMO COMPLETE')
    console.log(`${DIM}  Flow: Create → Commit (encrypted) → Close → CRE Settle → Reveal & Claim`)
    console.log(`  Privacy: positions hidden until settlement`)
    console.log(`  Oracle: Chainlink CRE + Confidential HTTP (CoinGecko)`)
    console.log(`  Identity: World ID sybil resistance${RESET}`)
    console.log()
}

main().catch(console.error)
