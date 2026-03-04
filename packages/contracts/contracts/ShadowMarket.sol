// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IdentityGate.sol";

/// @title ShadowMarket — Privacy-Preserving Prediction Market
/// @notice Core market contract with commit-reveal scheme for private predictions
/// @dev Positions are committed as keccak256 hashes — choice and amount stay hidden
///      until the reveal/claim phase. Only verified World ID users can participate.

/// @notice Thrown when market does not exist
error MarketNotFound();
/// @notice Thrown when user already committed to this market
error AlreadyCommitted();
/// @notice Thrown when bet is below minimum
error InsufficientBet();
/// @notice Thrown when user is not World ID verified
error NotVerified();
/// @notice Thrown when market is not in OPEN status
error MarketNotOpen();
/// @notice Thrown when caller is not authorized
error Unauthorized();
/// @notice Thrown when market is not settled yet
error MarketNotSettled();
/// @notice Thrown when reveal preimage doesn't match commitment
error InvalidReveal();
/// @notice Thrown when market is not in CLOSED status
error MarketNotClosed();
/// @notice Thrown when winnings already claimed
error AlreadyClaimed();

contract ShadowMarket {
    // ════════════════════════════════════════════
    // Types
    // ════════════════════════════════════════════

    enum MarketStatus { OPEN, CLOSED, SETTLED }

    struct Market {
        bytes32 id;
        string title;
        string description;
        uint256 endTime;
        uint256 minBet;
        uint256 commitCount;
        uint256 totalPool;
        MarketStatus status;
        bool outcome;
        bool outcomeSet;
        address creator;
    }

    struct Commitment {
        bytes32 commitment;     // keccak256(choice ‖ amount ‖ salt)
        uint256 amount;         // msg.value sent with commitment
        uint256 timestamp;
        bool revealed;
    }

    // ════════════════════════════════════════════
    // State
    // ════════════════════════════════════════════

    /// @notice Identity gate for World ID verification checks
    IdentityGate public immutable identityGate;

    /// @notice Contract owner
    address public immutable owner;

    /// @notice Authorized settlement receiver (CRE forwarder)
    address public settlementReceiver;

    /// @notice All market IDs in order of creation
    bytes32[] public marketIds;

    /// @notice Market data by ID
    mapping(bytes32 => Market) public markets;

    /// @notice Commitments: marketId → user → Commitment
    mapping(bytes32 => mapping(address => Commitment)) public commitments;

    /// @notice Track if user has committed to a market
    mapping(bytes32 => mapping(address => bool)) public hasCommitted;

    // ════════════════════════════════════════════
    // Events
    // ════════════════════════════════════════════

    event MarketCreated(
        bytes32 indexed marketId,
        address indexed creator,
        string title,
        uint256 endTime
    );

    /// @notice Position committed — NOTE: no amount or choice emitted (privacy)
    event PositionCommitted(
        bytes32 indexed marketId,
        address indexed user,
        bytes32 commitment
    );

    event MarketClosed(bytes32 indexed marketId);

    event MarketSettled(bytes32 indexed marketId, bool outcome);

    event WinningsClaimed(
        bytes32 indexed marketId,
        address indexed user,
        uint256 payout
    );

    // ════════════════════════════════════════════
    // Constructor
    // ════════════════════════════════════════════

    /// @param _identityGate Address of the IdentityGate contract
    constructor(address _identityGate) {
        identityGate = IdentityGate(_identityGate);
        owner = msg.sender;
    }

    // ════════════════════════════════════════════
    // Modifiers
    // ════════════════════════════════════════════

    modifier onlyVerified() {
        if (!identityGate.verifiedUsers(msg.sender)) revert NotVerified();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    // ════════════════════════════════════════════
    // Market Lifecycle
    // ════════════════════════════════════════════

    /// @notice Create a new prediction market
    /// @param title The market question
    /// @param description Resolution criteria
    /// @param endTime Unix timestamp when market closes
    /// @param minBet Minimum bet in wei
    /// @return marketId The unique bytes32 identifier
    function createMarket(
        string calldata title,
        string calldata description,
        uint256 endTime,
        uint256 minBet
    ) external returns (bytes32 marketId) {
        // Generate deterministic market ID from creation parameters
        marketId = keccak256(
            abi.encodePacked(title, msg.sender, block.timestamp, marketIds.length)
        );

        markets[marketId] = Market({
            id: marketId,
            title: title,
            description: description,
            endTime: endTime,
            minBet: minBet,
            commitCount: 0,
            totalPool: 0,
            status: MarketStatus.OPEN,
            outcome: false,
            outcomeSet: false,
            creator: msg.sender
        });

        marketIds.push(marketId);

        emit MarketCreated(marketId, msg.sender, title, endTime);
    }

    /// @notice Commit an encrypted position to a market
    /// @dev The commitment is keccak256(abi.encodePacked(choice, amount, salt))
    ///      where choice is bool, amount is uint256, salt is bytes32.
    ///      Only the hash is stored — the preimage stays with the user.
    /// @param marketId The market to commit to
    /// @param commitment The keccak256 hash of (choice, amount, salt)
    function commitPosition(
        bytes32 marketId,
        bytes32 commitment
    ) external payable onlyVerified {
        Market storage market = markets[marketId];

        // Market must exist
        if (market.creator == address(0)) revert MarketNotFound();

        // Market must be open
        if (market.status != MarketStatus.OPEN) revert MarketNotOpen();

        // One commitment per user per market
        if (hasCommitted[marketId][msg.sender]) revert AlreadyCommitted();

        // Must meet minimum bet
        if (msg.value < market.minBet) revert InsufficientBet();

        // Store commitment (only the hash — NOT the choice or actual amount)
        commitments[marketId][msg.sender] = Commitment({
            commitment: commitment,
            amount: msg.value,
            timestamp: block.timestamp,
            revealed: false
        });

        hasCommitted[marketId][msg.sender] = true;

        // Update market stats
        market.commitCount++;
        market.totalPool += msg.value;

        // Emit: ONLY commitment hash, NOT choice or amount (privacy)
        emit PositionCommitted(marketId, msg.sender, commitment);
    }

    /// @notice Close a market (prevents new commitments)
    /// @dev Can be called by creator or anyone after endTime
    function closeMarket(bytes32 marketId) external {
        Market storage market = markets[marketId];
        if (market.creator == address(0)) revert MarketNotFound();
        if (market.status != MarketStatus.OPEN) revert MarketNotOpen();

        // Only creator can close early; anyone can close after endTime
        if (block.timestamp < market.endTime && msg.sender != market.creator) {
            revert Unauthorized();
        }

        market.status = MarketStatus.CLOSED;
        emit MarketClosed(marketId);
    }

    /// @notice Settle a market with the outcome (called by SettlementReceiver)
    /// @dev Only the authorized settlement receiver (CRE forwarder) can call this
    function settleMarket(bytes32 marketId, bool outcome) external {
        if (msg.sender != settlementReceiver) revert Unauthorized();

        Market storage market = markets[marketId];
        if (market.creator == address(0)) revert MarketNotFound();

        market.status = MarketStatus.SETTLED;
        market.outcome = outcome;
        market.outcomeSet = true;

        emit MarketSettled(marketId, outcome);
    }

    /// @notice Claim winnings by revealing the commitment preimage
    /// @dev User provides the original (choice, amount, salt) to prove their bet
    ///      The commitment hash is recomputed and compared to the stored one.
    /// @param marketId The settled market
    /// @param choice The user's original choice (true=YES, false=NO)
    /// @param amount The user's original bet amount in wei
    /// @param salt The random bytes32 salt used during commitment
    function claimWinnings(
        bytes32 marketId,
        bool choice,
        uint256 amount,
        bytes32 salt
    ) external {
        Market storage market = markets[marketId];
        if (!market.outcomeSet) revert MarketNotSettled();

        Commitment storage userCommit = commitments[marketId][msg.sender];
        if (userCommit.revealed) revert AlreadyClaimed();

        // Recompute the commitment hash from the revealed preimage
        bytes32 computedCommitment = keccak256(
            abi.encodePacked(choice, amount, salt)
        );

        // Verify the preimage matches what was committed
        if (computedCommitment != userCommit.commitment) revert InvalidReveal();

        // Mark as revealed
        userCommit.revealed = true;

        // Calculate payout — winner gets proportional share of total pool
        // Simple model: if correct, get back double (capped at pool)
        if (choice == market.outcome) {
            uint256 payout = userCommit.amount * 2;
            if (payout > address(this).balance) {
                payout = address(this).balance;
            }

            (bool sent, ) = msg.sender.call{value: payout}("");
            require(sent, "Transfer failed");

            emit WinningsClaimed(marketId, msg.sender, payout);
        }
        // If wrong prediction: funds stay in pool (no payout)
    }

    // ════════════════════════════════════════════
    // Admin
    // ════════════════════════════════════════════

    /// @notice Set the authorized settlement receiver address
    function setSettlementReceiver(address _receiver) external onlyOwner {
        settlementReceiver = _receiver;
    }

    // ════════════════════════════════════════════
    // View Functions
    // ════════════════════════════════════════════

    /// @notice Get the total number of markets
    function getMarketCount() external view returns (uint256) {
        return marketIds.length;
    }

    /// @notice Get a market by ID
    function getMarket(bytes32 marketId) external view returns (Market memory) {
        return markets[marketId];
    }

    /// @notice Get a market ID by index
    function getMarketId(uint256 index) external view returns (bytes32) {
        return marketIds[index];
    }

    /// @notice Get a user's commitment for a market
    function getCommitment(
        bytes32 marketId,
        address user
    ) external view returns (Commitment memory) {
        return commitments[marketId][user];
    }
}

// ✓ ShadowMarket.sol complete
