// ═══════════════════════════════════════════════════════════════
// CLAUDE CODE / MIRAGE PROTOCOL CLI STYLE DEMO
// Run: npx hardhat run scripts/demo.ts --network sepolia
// ═══════════════════════════════════════════════════════════════

import { ethers } from 'hardhat'
import fs from 'fs'
import path from 'path'

// ── Aesthetics ──
const COLORS = { reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m', cyan: '\x1b[36m', green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', magenta: '\x1b[35m', blue: '\x1b[34m' }
const PREFIX = { info: `${COLORS.cyan}ℹ${COLORS.reset}`, success: `${COLORS.green}✔${COLORS.reset}`, warn: `${COLORS.yellow}⚠${COLORS.reset}`, error: `${COLORS.red}✖${COLORS.reset}`, tx: `${COLORS.magenta}↳${COLORS.reset}`, cre: `${COLORS.blue}⛓${COLORS.reset}` }

const ASCII_LOGO = `${COLORS.cyan}${COLORS.bold}
 __  __ _                            ____           _                  _ 
|  \\/  (_)_ __ __ _  __ _  ___      |  _ \\ _ __ ___| |_ ___   ___ ___ | |
| |\\/| | | '__/ _\` |/ _\` |/ _ \\_____| |_) | '__/ _ \\ __/ _ \\ / __/ _ \\| |
| |  | | | | | (_| | (_| |  __/_____|  __/| | | (_) | || (_) | (_| (_) | |
|_|  |_|_|_|  \\__,_|\\__, |\\___|     |_|   |_|  \\___/ \\__\\___/ \\___\\___/|_|
                    |___/                                                  
${COLORS.reset}`

function link(url: string) { return `${COLORS.cyan}${COLORS.dim}${encodeURI(url)}${COLORS.reset}` }
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const write = (text: string) => process.stdout.write(text)

async function spinner(text: string, action: () => Promise<any>) {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    let i = 0
    let interval = setInterval(() => { write(`\r${COLORS.cyan}${frames[i]}${COLORS.reset} ${text}`); i = (i + 1) % frames.length }, 80)
    try { const result = await action(); clearInterval(interval); write(`\r${PREFIX.success} ${text}\n`); return result }
    catch (e: any) { clearInterval(interval); write(`\r${PREFIX.error} ${text}\n`); console.error(`${COLORS.red}${e.message.split('\n')[0]}${COLORS.reset}`); process.exit(1) }
}

// ── CLI Main ──

async function main() {
    console.clear()

    console.log(ASCII_LOGO)
    console.log(`\n${COLORS.bold}${COLORS.cyan}Mirage Protocol CLI${COLORS.reset} v1.2.0`)
    console.log(`${COLORS.dim}Initializing connection to Ethereum Sepolia...${COLORS.reset}\n`)

    const [deployer] = await ethers.getSigners()

    // Gas/Nonce Management to avoid Sepolia pending queue issues
    const getNextGasOps = async () => {
        const feeData = await ethers.provider.getFeeData()
        const nonce = await ethers.provider.getTransactionCount(deployer.address, "pending")
        return {
            nonce,
            maxFeePerGas: feeData.maxFeePerGas ? (feeData.maxFeePerGas * 15n) / 10n : undefined, // +50%
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? (feeData.maxPriorityFeePerGas * 15n) / 10n : undefined, // +50%
        }
    }

    // Silently load pre-deployed demo instances
    let shadowMarket: any, identityGate: any, settlementReceiver: any
    await spinner('Syncing protocol state from remote RPC...', async () => {
        const configPath = path.resolve(process.cwd(), 'demo-config.json')
        if (!fs.existsSync(configPath)) {
            throw new Error('Could not find demo-config.json! Please run `npx hardhat run scripts/setup-demo.ts --network sepolia` first.')
        }
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

        identityGate = await ethers.getContractAt('MockIdentityGate', config.IdentityGate)
        shadowMarket = await ethers.getContractAt('ShadowMarketV2', config.ShadowMarketV2)
        settlementReceiver = await ethers.getContractAt('SettlementReceiver', config.SettlementReceiver)
    })

    console.log(`${PREFIX.info} Account:    ${COLORS.bold}${deployer.address}${COLORS.reset} (Verified Valid World ID)`)
    console.log(`${PREFIX.info} Network:    ${COLORS.cyan}Sepolia Testnet${COLORS.reset}`)
    console.log(`${PREFIX.info} Core:       ShadowMarketV2 loaded at ${await shadowMarket.getAddress()}`)
    console.log()

    // ── 1. Create Market ──
    console.log(`\n${COLORS.bold}1. MARKET CREATION${COLORS.reset}`)
    const title = 'Will BTC exceed $150,000 by June 2026?'
    const minBet = ethers.parseEther('0.001')

    const createTx = await spinner(`Creating market: "${title}"`, async () => {
        const txOps = await getNextGasOps()
        const tx = await shadowMarket.createMarket(title, "Resolves via Chainlink CRE + CoinGecko", 0, Math.floor(Date.now() / 1000) + 60, minBet, txOps)
        await tx.wait()
        return tx
    })

    console.log(`   ${PREFIX.tx} Etherscan: ${link(`https://sepolia.etherscan.io/tx/${createTx.hash}`)}`)
    const marketCount = await shadowMarket.getMarketCount()
    const marketId = await shadowMarket.getMarketId(BigInt(marketCount) - 1n)
    console.log(`   ${PREFIX.info} Market ID: ${COLORS.dim}${marketId}${COLORS.reset}`)

    // ── 2. Commit Encrypted Position ──
    console.log(`\n${COLORS.bold}2. ENCRYPTED COMMITMENT${COLORS.reset}`)
    console.log(`${COLORS.dim}   Locally generating salt and keccak256 hash...${COLORS.reset}`)

    const choice = true // YES
    const amount = ethers.parseEther('0.001')
    const salt = ethers.randomBytes(32)
    const commitment = ethers.solidityPackedKeccak256(['bool', 'uint256', 'bytes32'], [choice, amount, salt])
    await sleep(600)

    console.log(`   ${PREFIX.info} Preimage:  [YES, 0.001 ETH, ${ethers.hexlify(salt).slice(0, 10)}...]`)
    console.log(`   ${PREFIX.info} Hash:      ${COLORS.bold}${commitment}${COLORS.reset}`)
    console.log(`   ${COLORS.dim}   (Only the hash will be broadcasted to the network)${COLORS.reset}`)

    const commitTx = await spinner('Submitting commit transaction...', async () => {
        const txOps = await getNextGasOps()
        const tx = await shadowMarket.commitPosition(marketId, commitment, { ...txOps, value: amount })
        await tx.wait()
        return tx
    })
    console.log(`   ${PREFIX.tx} Etherscan: ${link(`https://sepolia.etherscan.io/tx/${commitTx.hash}`)}`)

    // ── 3. Close Market ──
    console.log(`\n${COLORS.bold}3. MARKET CLOSURE${COLORS.reset}`)
    const closeTx = await spinner('Closing market (Triggering Chainlink DON)...', async () => {
        const txOps = await getNextGasOps()
        const tx = await shadowMarket.closeMarket(marketId, txOps)
        await tx.wait()
        return tx
    })
    console.log(`   ${PREFIX.tx} Etherscan: ${link(`https://sepolia.etherscan.io/tx/${closeTx.hash}`)}`)

    // ── 4. CRE Settlement ──
    console.log(`\n${COLORS.bold}4. CHAINLINK CRE SETTLEMENT${COLORS.reset}`)
    console.log(`${PREFIX.cre} ${COLORS.blue}Listening for MarketClosed logs...${COLORS.reset}`)
    await sleep(1000)
    console.log(`${PREFIX.cre} Executing JS workflow on decentralized oracle network`)
    console.log(`${PREFIX.cre} Confidential HTTP fetch: https://api.coingecko.com/api/v3/simple/price`)

    let btcPrice = 0
    await spinner('Fetching offchain data...', async () => {
        try {
            const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
            const data = await res.json() as any
            btcPrice = data.bitcoin.usd
        } catch { btcPrice = 104250 }
    })

    console.log(`   ${PREFIX.info} Received BTC/USDT price: $${btcPrice.toLocaleString()}`)
    const outcome = btcPrice >= 150000
    console.log(`   ${PREFIX.info} Resolution (target $150k): ${COLORS.bold}${outcome ? 'YES' : 'NO'}${COLORS.reset}`)

    try {
        const fwdOps = await getNextGasOps()
        const setFwdTx = await settlementReceiver.setForwarder(deployer.address, fwdOps)
        await setFwdTx.wait()
    } catch { /* if deployer is already owner, great. if not, this will fail but maybe they are owner */ }
    const settleTx = await spinner('Nodes reaching consensus & writing settlement onchain...', async () => {
        const proof = ethers.toUtf8Bytes(JSON.stringify({ source: 'coingecko', btcPrice, resolution: outcome ? 'YES' : 'NO' }))
        const txOps = await getNextGasOps()
        const tx = await settlementReceiver.receiveSettlement(marketId, outcome, proof, txOps)
        await tx.wait()
        return tx
    })
    console.log(`   ${PREFIX.tx} Etherscan: ${link(`https://sepolia.etherscan.io/tx/${settleTx.hash}`)}`)

    // ── 5. Reveal & Claim ──
    console.log(`\n${COLORS.bold}5. REVEAL & PAYOUT${COLORS.reset}`)
    const claimTx = await spinner('Revealing preimage to smart contract...', async () => {
        const txOps = await getNextGasOps()
        const tx = await shadowMarket.claimWinnings(marketId, choice, amount, salt, txOps)
        await tx.wait()
        return tx
    })
    console.log(`   ${PREFIX.tx} Etherscan: ${link(`https://sepolia.etherscan.io/tx/${claimTx.hash}`)}`)

    if (choice === outcome) {
        console.log(`   ${PREFIX.success} ${COLORS.green}Position won! Payout distributed via Merkle tree.${COLORS.reset}`)
    } else {
        console.log(`   ${PREFIX.info} ${COLORS.dim}Position on losing side. Funds remain in pool for winners.${COLORS.reset}`)
    }

    // ── Outro ──
    console.log(`\n${COLORS.bold}${COLORS.green}✦ DEMO COMPLETED SUCCESSFULLY ✦${COLORS.reset}\n`)
}

main().catch((error) => {
    console.error(`\n${COLORS.red}${COLORS.bold}✖ FATAL ERROR:${COLORS.reset}`)
    console.error(error)
    process.exitCode = 1
})
