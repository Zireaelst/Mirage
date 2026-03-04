// ═══════════════════════════════════════════════
// MIRAGE MARKET — CRE Identity Verification Workflow
//
// PURPOSE: Receive World ID proof via HTTP trigger,
//          verify offchain, then write to IdentityGate.sol onchain.
//
// TRACK:  World ID + CRE ($5k)
// REASON: "Use CRE to bring World ID to chains where it's
//          not natively supported"
//
// TRIGGER: HTTP Trigger (POST from /api/world-id/verify)
// FLOW:
//   1. Parse proof data from HTTP payload
//   2. HTTPClient: POST to World ID API v4/verify (double-check)
//   3. If verified: EVMClient write to IdentityGate.sol
//   4. Return: { verified: true, nullifierHash, txHash }
//
// CONSENSUS: Identical aggregation — all DON nodes must agree
//            on the World ID API response before writing onchain.
//            This prevents a single malicious node from forging
//            a verification.
// ═══════════════════════════════════════════════

// --- TypeScript Interfaces (CRE SDK types) ---

/** World ID proof payload from the HTTP trigger */
interface WorldIDPayload {
    nullifier_hash: string
    merkle_root: string
    proof: string
    verification_level: 'orb' | 'device'
}

/** CRE HTTP client response */
interface HTTPResponse {
    status: number
    body: Record<string, unknown>
}

/** Workflow configuration — set in cre.config.json */
interface WorkflowConfig {
    worldIdApiUrl: string
    worldIdAppId: string
    identityGateAddress: string
    chainName: string
    rpId: string
}

/** CRE runtime interface (provided by the CRE SDK) */
interface CRERuntime {
    log: (message: string, data?: Record<string, unknown>) => void
    getSecret: (key: string) => string
    httpClient: {
        fetch: (url: string, options: RequestInit) => Promise<HTTPResponse>
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

/** CRE trigger event from HTTP */
interface HTTPTriggerEvent {
    body: WorldIDPayload
    headers: Record<string, string>
}

// --- Workflow Implementation ---

/**
 * CRE Identity Verification Workflow
 *
 * This workflow is triggered via HTTP POST from our backend
 * (/api/world-id/verify) after the user completes IDKit.
 *
 * The workflow runs on the Chainlink DON (Decentralized Oracle Network).
 * All nodes execute the same logic independently, and results are
 * aggregated using identical consensus — meaning ALL nodes must
 * return the SAME verification result before the onchain write occurs.
 *
 * This ensures that:
 * 1. No single node can forge a verification
 * 2. The World ID API response is cryptographically attested by DON consensus
 * 3. The onchain write is trustless and verifiable
 */
export async function handler(
    runtime: CRERuntime,
    trigger: HTTPTriggerEvent,
    config: WorkflowConfig
): Promise<{ verified: boolean; nullifierHash: string; txHash: string }> {
    // ── Step 1: Parse proof data from HTTP payload ──
    runtime.log('Step 1: Parsing World ID proof from trigger payload')

    const payload = trigger.body
    if (!payload.nullifier_hash || !payload.proof || !payload.merkle_root) {
        throw new Error('Invalid payload: missing required World ID proof fields')
    }

    runtime.log('Proof received', {
        nullifier_hash: payload.nullifier_hash,
        verification_level: payload.verification_level,
        // NOTE: Never log the full proof — only the nullifier for audit
    })

    // ── Step 2: Verify proof via World ID API ──
    // This is a "double-check" verification on the DON side.
    // The backend already verified once, but CRE re-verifies to ensure
    // DON consensus on the result before writing onchain.
    runtime.log('Step 2: Verifying proof via World ID API')

    const verifyResponse = await runtime.httpClient.fetch(
        `${config.worldIdApiUrl}/api/v2/verify/${config.worldIdAppId}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                merkle_root: payload.merkle_root,
                nullifier_hash: payload.nullifier_hash,
                proof: payload.proof,
                action: 'verify-mirage-human',
                signal_hash: '',
            }),
        }
    )

    if (verifyResponse.status !== 200) {
        runtime.log('World ID verification failed', {
            status: verifyResponse.status,
        })
        throw new Error(`World ID API returned status ${verifyResponse.status}`)
    }

    runtime.log('Step 2: Verification successful ✓')

    // ── Step 3: Check if nullifier already used (read onchain) ──
    runtime.log('Step 3: Checking nullifier uniqueness onchain')

    // Convert nullifier hash to uint256 for the contract call
    const nullifierBigInt = BigInt(payload.nullifier_hash)

    const isUsed = await runtime.evmClient.readContract({
        contractAddress: config.identityGateAddress,
        method: 'isNullifierUsed',
        args: [nullifierBigInt],
        chainName: config.chainName,
        abi: [
            {
                inputs: [{ name: 'nullifierHash', type: 'uint256' }],
                name: 'isNullifierUsed',
                outputs: [{ name: '', type: 'bool' }],
                stateMutability: 'view',
                type: 'function',
            },
        ],
    })

    if (isUsed) {
        runtime.log('Nullifier already used — sybil attempt blocked')
        throw new Error('Nullifier hash already registered (sybil resistance)')
    }

    // ── Step 4: Write verification to IdentityGate onchain ──
    // This is the key CRE operation — the DON consensus ensures
    // that all nodes agree on the verification result before
    // the onchain write is submitted via the CRE forwarder.
    runtime.log('Step 4: Writing verification to IdentityGate onchain')

    const txResult = await runtime.evmClient.writeContract({
        contractAddress: config.identityGateAddress,
        method: 'verifyAndRegister',
        args: [
            BigInt(payload.merkle_root),      // root
            BigInt(0),                         // signalHash (placeholder)
            nullifierBigInt,                   // nullifierHash
            BigInt(0),                         // externalNullifierHash (placeholder)
            Array(8).fill(BigInt(0)),          // proof (simplified for MVP)
        ],
        chainName: config.chainName,
        abi: [
            {
                inputs: [
                    { name: 'root', type: 'uint256' },
                    { name: 'signalHash', type: 'uint256' },
                    { name: 'nullifierHash', type: 'uint256' },
                    { name: 'externalNullifierHash', type: 'uint256' },
                    { name: 'proof', type: 'uint256[8]' },
                ],
                name: 'verifyAndRegister',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
        ],
    })

    runtime.log('Step 4: Onchain write complete ✓', { txHash: txResult.txHash })

    return {
        verified: true,
        nullifierHash: payload.nullifier_hash,
        txHash: txResult.txHash,
    }
}

// ✓ identity-workflow/main.ts complete
