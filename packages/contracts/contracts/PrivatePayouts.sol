// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title PrivatePayouts — Privacy-Focused Payout Distribution
/// @notice Handles batch claim processing and privacy-preserving payout tracking.
/// @dev Uses a Merkle proof pattern so users can prove claim eligibility
///      without revealing individual amounts in events. Payouts are batched
///      to reduce gas costs and minimize onchain fingerprinting.

/// @notice Custom errors
error InvalidMerkleProof();
error AlreadyClaimed();
error InsufficientBalance();
error OnlyAdmin();
error BatchEmpty();
error MerkleRootNotSet();

contract PrivatePayouts {
    // ════════════════════════════════════════════
    // Types
    // ════════════════════════════════════════════

    struct PayoutBatch {
        bytes32 merkleRoot;       // Root of the payout Merkle tree
        uint256 totalAmount;      // Total ETH in this batch
        uint256 claimedAmount;    // Amount claimed so far
        uint256 createdAt;
        bool finalized;
    }

    // ════════════════════════════════════════════
    // State
    // ════════════════════════════════════════════

    /// @notice Contract administrator (typically the ShadowMarket or owner)
    address public immutable admin;

    /// @notice Payout batches by market ID
    mapping(bytes32 => PayoutBatch) public batches;

    /// @notice Track claimed leaves: marketId → leafHash → claimed
    mapping(bytes32 => mapping(bytes32 => bool)) public claimed;

    /// @notice Total payouts processed
    uint256 public totalPayoutsProcessed;

    // ════════════════════════════════════════════
    // Events — privacy-preserving design
    // ════════════════════════════════════════════

    /// @notice Emitted when a payout batch is created
    /// NOTE: individual amounts are NOT emitted — only batch totals
    event BatchCreated(
        bytes32 indexed marketId,
        bytes32 merkleRoot,
        uint256 totalAmount
    );

    /// @notice Emitted when a payout is claimed
    /// NOTE: amount is NOT emitted — only the leaf hash for verification
    event PayoutClaimed(
        bytes32 indexed marketId,
        address indexed recipient,
        bytes32 leafHash
    );

    // ════════════════════════════════════════════
    // Constructor
    // ════════════════════════════════════════════

    constructor() {
        admin = msg.sender;
    }

    // ════════════════════════════════════════════
    // Admin Functions
    // ════════════════════════════════════════════

    /// @notice Create a payout batch for a settled market
    /// @dev The merkle tree leaves are: keccak256(recipient, amount)
    ///      The tree is constructed offchain by the CRE settlement workflow
    /// @param marketId The settled market ID
    /// @param merkleRoot Root of the payout Merkle tree
    function createBatch(
        bytes32 marketId,
        bytes32 merkleRoot
    ) external payable {
        if (msg.sender != admin) revert OnlyAdmin();
        if (merkleRoot == bytes32(0)) revert BatchEmpty();

        batches[marketId] = PayoutBatch({
            merkleRoot: merkleRoot,
            totalAmount: msg.value,
            claimedAmount: 0,
            createdAt: block.timestamp,
            finalized: true
        });

        emit BatchCreated(marketId, merkleRoot, msg.value);
    }

    // ════════════════════════════════════════════
    // Claim Functions
    // ════════════════════════════════════════════

    /// @notice Claim payout using Merkle proof
    /// @dev User proves their leaf (address, amount) is in the payout tree
    /// @param marketId The settled market ID
    /// @param amount The payout amount in wei
    /// @param merkleProof Array of sibling hashes for the Merkle proof
    function claim(
        bytes32 marketId,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external {
        PayoutBatch storage batch = batches[marketId];
        if (batch.merkleRoot == bytes32(0)) revert MerkleRootNotSet();

        // Compute leaf hash
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));

        // Check not already claimed
        if (claimed[marketId][leaf]) revert AlreadyClaimed();

        // Verify Merkle proof
        if (!verifyProof(merkleProof, batch.merkleRoot, leaf)) {
            revert InvalidMerkleProof();
        }

        // Check sufficient balance
        if (amount > address(this).balance) revert InsufficientBalance();

        // Mark as claimed
        claimed[marketId][leaf] = true;
        batch.claimedAmount += amount;

        unchecked { totalPayoutsProcessed++; }

        // Transfer payout
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Transfer failed");

        // Emit: only leaf hash, NOT amount (privacy)
        emit PayoutClaimed(marketId, msg.sender, leaf);
    }

    // ════════════════════════════════════════════
    // Merkle Verification
    // ════════════════════════════════════════════

    /// @notice Verify a Merkle proof
    /// @dev Standard OpenZeppelin-style Merkle proof verification
    function verifyProof(
        bytes32[] calldata proof,
        bytes32 root,
        bytes32 leaf
    ) internal pure returns (bool) {
        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length;) {
            bytes32 proofElement = proof[i];

            if (computedHash <= proofElement) {
                computedHash = keccak256(
                    abi.encodePacked(computedHash, proofElement)
                );
            } else {
                computedHash = keccak256(
                    abi.encodePacked(proofElement, computedHash)
                );
            }

            unchecked { i++; }
        }

        return computedHash == root;
    }

    // ════════════════════════════════════════════
    // View Functions
    // ════════════════════════════════════════════

    /// @notice Get batch details for a market
    function getBatch(bytes32 marketId) external view returns (PayoutBatch memory) {
        return batches[marketId];
    }

    /// @notice Check if a specific claim has been made
    function isClaimed(bytes32 marketId, address recipient, uint256 amount) external view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(recipient, amount));
        return claimed[marketId][leaf];
    }

    /// @notice Allow contract to receive ETH for payout funding
    receive() external payable {}
}

// ✓ PrivatePayouts.sol complete
