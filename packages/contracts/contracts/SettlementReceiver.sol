// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ShadowMarket.sol";

/// @title SettlementReceiver — CRE Settlement Forwarder
/// @notice Receives market settlement reports from the Chainlink CRE workflow
/// @dev Only the authorized CRE forwarder address can call receiveSettlement.
///      The forwarder is set by the contract owner to match the CRE deployment.

/// @notice Thrown when caller is not the authorized CRE forwarder
error UnauthorizedForwarder();
/// @notice Thrown when caller is not the contract owner
error OnlyOwner();
/// @notice Thrown when market has already been settled
error AlreadySettled();

contract SettlementReceiver {
    // ════════════════════════════════════════════
    // Types
    // ════════════════════════════════════════════

    struct Settlement {
        bytes32 marketId;
        bool outcome;
        uint256 settledAt;
        bytes proof;           // Offchain attestation data from CRE
    }

    // ════════════════════════════════════════════
    // State
    // ════════════════════════════════════════════

    /// @notice The ShadowMarket contract to forward settlements to
    ShadowMarket public immutable shadowMarket;

    /// @notice Contract owner (deployer)
    address public immutable owner;

    /// @notice Authorized CRE forwarder address
    /// This is set to the CRE forwarder contract after workflow deployment
    address public forwarder;

    /// @notice Settlement records by market ID
    mapping(bytes32 => Settlement) public settlements;

    /// @notice Whether a market has been settled through this receiver
    mapping(bytes32 => bool) public isSettled;

    /// @notice Total settlements processed
    uint256 public settlementCount;

    // ════════════════════════════════════════════
    // Events
    // ════════════════════════════════════════════

    event SettlementReceived(
        bytes32 indexed marketId,
        bool outcome,
        uint256 timestamp
    );

    event ForwarderUpdated(address indexed oldForwarder, address indexed newForwarder);

    // ════════════════════════════════════════════
    // Constructor
    // ════════════════════════════════════════════

    /// @param _shadowMarket Address of the ShadowMarket contract
    constructor(address _shadowMarket) {
        shadowMarket = ShadowMarket(_shadowMarket);
        owner = msg.sender;
    }

    // ════════════════════════════════════════════
    // Core Functions
    // ════════════════════════════════════════════

    /// @notice Receive a settlement report from the CRE workflow
    /// @dev Only callable by the authorized CRE forwarder.
    ///      The proof bytes contain the offchain attestation from CRE consensus.
    /// @param marketId The bytes32 market identifier
    /// @param outcome The resolved outcome (true = YES, false = NO)
    /// @param proof Offchain attestation data from CRE DON consensus
    function receiveSettlement(
        bytes32 marketId,
        bool outcome,
        bytes calldata proof
    ) external {
        // Only the authorized CRE forwarder can submit settlements
        if (msg.sender != forwarder) revert UnauthorizedForwarder();

        // Prevent double-settlement
        if (isSettled[marketId]) revert AlreadySettled();

        // Record the settlement
        settlements[marketId] = Settlement({
            marketId: marketId,
            outcome: outcome,
            settledAt: block.timestamp,
            proof: proof
        });

        isSettled[marketId] = true;

        unchecked { settlementCount++; }

        // Forward settlement to the ShadowMarket contract
        shadowMarket.settleMarket(marketId, outcome);

        emit SettlementReceived(marketId, outcome, block.timestamp);
    }

    // ════════════════════════════════════════════
    // Admin
    // ════════════════════════════════════════════

    /// @notice Set the authorized CRE forwarder address
    /// @dev Call this after deploying the CRE workflow to set the forwarder
    function setForwarder(address _forwarder) external {
        if (msg.sender != owner) revert OnlyOwner();

        address oldForwarder = forwarder;
        forwarder = _forwarder;

        emit ForwarderUpdated(oldForwarder, _forwarder);
    }

    // ════════════════════════════════════════════
    // View Functions
    // ════════════════════════════════════════════

    /// @notice Get settlement details for a market
    function getSettlement(bytes32 marketId) external view returns (Settlement memory) {
        return settlements[marketId];
    }
}

// ✓ SettlementReceiver.sol complete
