// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IdentityGate — World ID Sybil Resistance for Mirage Market
/// @notice Verifies World ID proofs and registers unique humans
/// @dev Uses WorldIDRouter on Sepolia (0x469449f251692e0779667583026b5a1e99512157)

/// @notice Interface for the World ID Router contract
interface IWorldIDRouter {
    /// @notice Verifies a World ID proof
    /// @param root The merkle root of the identity tree
    /// @param groupId The group ID (1 = Orb, 0 = Device)  
    /// @param signalHash Hash of the signal (usually user's address)
    /// @param nullifierHash Unique nullifier for sybil resistance
    /// @param externalNullifierHash Hash of the external nullifier (app_id + action)
    /// @param proof The ZK proof (8 uint256 values)
    function verifyProof(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external;
}

/// @notice Thrown when user is already verified
error AlreadyVerified();
/// @notice Thrown when nullifier hash has been used (sybil attempt)
error DuplicateNullifier();
/// @notice Thrown when the ZK proof is invalid
error InvalidProof();
/// @notice Thrown when caller is not the contract owner
error Unauthorized();

contract IdentityGate {
    // ════════════════════════════════════════════
    // State
    // ════════════════════════════════════════════

    /// @notice The World ID Router contract
    IWorldIDRouter public immutable worldIdRouter;

    /// @notice Group ID for Orb verification level
    uint256 public constant GROUP_ID = 1;

    /// @notice Contract deployer (for admin functions)
    address public immutable owner;

    /// @notice Tracks verified wallet addresses
    mapping(address => bool) public verifiedUsers;

    /// @notice Tracks used nullifier hashes to prevent sybil attacks
    /// Each human gets exactly one nullifier per action — reuse = sybil
    mapping(uint256 => bool) public nullifierHashes;

    /// @notice Total number of verified unique humans
    uint256 public verifiedCount;

    // ════════════════════════════════════════════
    // Events
    // ════════════════════════════════════════════

    /// @notice Emitted when a new user is verified
    event UserVerified(address indexed user, uint256 indexed nullifierHash);

    // ════════════════════════════════════════════
    // Constructor
    // ════════════════════════════════════════════

    /// @param _worldIdRouter Address of the WorldIDRouter on Sepolia
    constructor(address _worldIdRouter) {
        worldIdRouter = IWorldIDRouter(_worldIdRouter);
        owner = msg.sender;
    }

    // ════════════════════════════════════════════
    // External Functions
    // ════════════════════════════════════════════

    /// @notice Verify a World ID proof and register the calling wallet
    /// @dev The proof is verified against the WorldIDRouter contract.
    ///      Each nullifier hash can only be used once (sybil resistance).
    /// @param root The merkle root of the World ID identity tree
    /// @param signalHash Hash of the signal (typically hash of msg.sender)
    /// @param nullifierHash Unique identifier for this human + action combo
    /// @param externalNullifierHash Hash of app_id + action string
    /// @param proof The Groth16 ZK proof (8 field elements)
    function verifyAndRegister(
        uint256 root,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external {
        // Prevent double-registration of the same wallet
        if (verifiedUsers[msg.sender]) revert AlreadyVerified();

        // Prevent the same human from registering with a different wallet
        if (nullifierHashes[nullifierHash]) revert DuplicateNullifier();

        // Verify the ZK proof against the World ID Router
        // This call reverts if the proof is invalid
        worldIdRouter.verifyProof(
            root,
            GROUP_ID,
            signalHash,
            nullifierHash,
            externalNullifierHash,
            proof
        );

        // Mark wallet as verified
        verifiedUsers[msg.sender] = true;

        // Record nullifier hash to prevent reuse
        nullifierHashes[nullifierHash] = true;

        // Increment counter
        unchecked { verifiedCount++; }

        emit UserVerified(msg.sender, nullifierHash);
    }

    // ════════════════════════════════════════════
    // View Functions
    // ════════════════════════════════════════════

    /// @notice Check if an address is verified
    function isVerified(address user) external view returns (bool) {
        return verifiedUsers[user];
    }

    /// @notice Check if a nullifier hash has been used
    function isNullifierUsed(uint256 nullifierHash) external view returns (bool) {
        return nullifierHashes[nullifierHash];
    }
}

// ✓ IdentityGate.sol complete
