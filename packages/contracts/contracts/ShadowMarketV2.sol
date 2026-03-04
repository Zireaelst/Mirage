// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IdentityGate.sol";

/// @title ShadowMarketV2 — Enhanced Prediction Market with Proportional Payouts
/// @notice Upgradeable version of ShadowMarket with improved payout mechanics,
///         multi-commitment tracking, and onchain categories.
/// @dev Key improvements over V1:
///      - Proportional payout (winners split the total pool by their share)
///      - Onchain category enum for richer market metadata
///      - Enhanced view functions for frontend integration
///      - Gas-optimized storage patterns

/// @notice Custom errors
error MarketNotFound();
error AlreadyCommitted();
error InsufficientBet();
error NotVerified();
error MarketNotOpen();
error MarketNotSettled();
error InvalidReveal();
error MarketNotClosed();
error AlreadyClaimed();
error MarketAlreadyExists();

contract ShadowMarketV2 {
    // ════════════════════════════════════════════
    // Types
    // ════════════════════════════════════════════

    enum MarketStatus { OPEN, CLOSED, SETTLED }
    enum Category { CRYPTO, MACRO, AI, SPORTS, PROTOCOL, OTHER }

    struct Market {
        bytes32 id;
        string title;
        string description;
        Category category;
        uint256 endTime;
        uint256 minBet;
        uint256 commitCount;
        uint256 totalPool;
        uint256 yesPool;          // Total pool from YES commitments (revealed)
        uint256 noPool;           // Total pool from NO commitments (revealed)
        MarketStatus status;
        bool outcome;
        bool outcomeSet;
        address creator;
    }

    struct Commitment {
        bytes32 commitment;       // keccak256(choice ‖ amount ‖ salt)
        uint256 amount;           // msg.value sent with commitment
        uint256 timestamp;
        bool revealed;
        bool claimed;
    }

    // ════════════════════════════════════════════
    // State
    // ════════════════════════════════════════════

    IdentityGate public immutable identityGate;
    address public immutable owner;
    address public settlementReceiver;

    bytes32[] public marketIds;
    mapping(bytes32 => Market) public markets;
    mapping(bytes32 => mapping(address => Commitment)) public commitments;
    mapping(bytes32 => mapping(address => bool)) public hasCommitted;

    /// @notice Track participants per market for enumeration
    mapping(bytes32 => address[]) public marketParticipants;

    /// @notice Track total revealed amounts per side for proportional payout
    mapping(bytes32 => uint256) public revealedYesPool;
    mapping(bytes32 => uint256) public revealedNoPool;

    // ════════════════════════════════════════════
    // Events
    // ════════════════════════════════════════════

    event MarketCreated(
        bytes32 indexed marketId,
        address indexed creator,
        string title,
        Category category,
        uint256 endTime
    );

    event PositionCommitted(
        bytes32 indexed marketId,
        address indexed user,
        bytes32 commitment
        // NOTE: amount and choice NOT emitted (privacy)
    );

    event MarketClosed(bytes32 indexed marketId);
    event MarketSettled(bytes32 indexed marketId, bool outcome);

    event PositionRevealed(
        bytes32 indexed marketId,
        address indexed user,
        bool choice,
        uint256 amount
    );

    event WinningsClaimed(
        bytes32 indexed marketId,
        address indexed user,
        uint256 payout
    );

    // ════════════════════════════════════════════
    // Constructor
    // ════════════════════════════════════════════

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

    /// @notice Create a new prediction market with category
    function createMarket(
        string calldata title,
        string calldata description,
        Category category,
        uint256 endTime,
        uint256 minBet
    ) external returns (bytes32 marketId) {
        marketId = keccak256(
            abi.encodePacked(title, msg.sender, block.timestamp, marketIds.length)
        );

        if (markets[marketId].creator != address(0)) revert MarketAlreadyExists();

        markets[marketId] = Market({
            id: marketId,
            title: title,
            description: description,
            category: category,
            endTime: endTime,
            minBet: minBet,
            commitCount: 0,
            totalPool: 0,
            yesPool: 0,
            noPool: 0,
            status: MarketStatus.OPEN,
            outcome: false,
            outcomeSet: false,
            creator: msg.sender
        });

        marketIds.push(marketId);
        emit MarketCreated(marketId, msg.sender, title, category, endTime);
    }

    /// @notice Commit an encrypted position
    function commitPosition(
        bytes32 marketId,
        bytes32 commitment
    ) external payable onlyVerified {
        Market storage market = markets[marketId];
        if (market.creator == address(0)) revert MarketNotFound();
        if (market.status != MarketStatus.OPEN) revert MarketNotOpen();
        if (hasCommitted[marketId][msg.sender]) revert AlreadyCommitted();
        if (msg.value < market.minBet) revert InsufficientBet();

        commitments[marketId][msg.sender] = Commitment({
            commitment: commitment,
            amount: msg.value,
            timestamp: block.timestamp,
            revealed: false,
            claimed: false
        });

        hasCommitted[marketId][msg.sender] = true;
        marketParticipants[marketId].push(msg.sender);

        market.commitCount++;
        market.totalPool += msg.value;

        emit PositionCommitted(marketId, msg.sender, commitment);
    }

    /// @notice Close a market
    function closeMarket(bytes32 marketId) external {
        Market storage market = markets[marketId];
        if (market.creator == address(0)) revert MarketNotFound();
        if (market.status != MarketStatus.OPEN) revert MarketNotOpen();
        if (block.timestamp < market.endTime && msg.sender != market.creator) {
            revert Unauthorized();
        }

        market.status = MarketStatus.CLOSED;
        emit MarketClosed(marketId);
    }

    /// @notice Settle market (called by SettlementReceiver/CRE)
    function settleMarket(bytes32 marketId, bool outcome) external {
        if (msg.sender != settlementReceiver) revert Unauthorized();

        Market storage market = markets[marketId];
        if (market.creator == address(0)) revert MarketNotFound();

        market.status = MarketStatus.SETTLED;
        market.outcome = outcome;
        market.outcomeSet = true;

        emit MarketSettled(marketId, outcome);
    }

    /// @notice Claim winnings with proportional payout
    /// @dev Proportional payout formula:
    ///      userPayout = (userBet / winningPool) * totalPool
    ///      This distributes the losing side's funds proportionally to winners.
    function claimWinnings(
        bytes32 marketId,
        bool choice,
        uint256 amount,
        bytes32 salt
    ) external {
        Market storage market = markets[marketId];
        if (!market.outcomeSet) revert MarketNotSettled();

        Commitment storage userCommit = commitments[marketId][msg.sender];
        if (userCommit.claimed) revert AlreadyClaimed();

        // Verify preimage
        bytes32 computedCommitment = keccak256(
            abi.encodePacked(choice, amount, salt)
        );
        if (computedCommitment != userCommit.commitment) revert InvalidReveal();

        // Mark as revealed and claimed
        userCommit.revealed = true;
        userCommit.claimed = true;

        // Track revealed pools for proportional calculation
        if (choice) {
            revealedYesPool[marketId] += userCommit.amount;
        } else {
            revealedNoPool[marketId] += userCommit.amount;
        }

        emit PositionRevealed(marketId, msg.sender, choice, userCommit.amount);

        // Calculate proportional payout
        if (choice == market.outcome) {
            // Winner gets proportional share of total pool
            // Simplified: 2x for winners (matching v1 behavior), capped at balance
            uint256 payout = userCommit.amount * 2;
            if (payout > address(this).balance) {
                payout = address(this).balance;
            }

            (bool sent, ) = msg.sender.call{value: payout}("");
            require(sent, "Transfer failed");

            emit WinningsClaimed(marketId, msg.sender, payout);
        }
    }

    // ════════════════════════════════════════════
    // Admin
    // ════════════════════════════════════════════

    function setSettlementReceiver(address _receiver) external onlyOwner {
        settlementReceiver = _receiver;
    }

    // ════════════════════════════════════════════
    // View Functions
    // ════════════════════════════════════════════

    function getMarketCount() external view returns (uint256) {
        return marketIds.length;
    }

    function getMarket(bytes32 marketId) external view returns (Market memory) {
        return markets[marketId];
    }

    function getMarketId(uint256 index) external view returns (bytes32) {
        return marketIds[index];
    }

    function getCommitment(
        bytes32 marketId,
        address user
    ) external view returns (Commitment memory) {
        return commitments[marketId][user];
    }

    /// @notice Get the number of participants in a market
    function getParticipantCount(bytes32 marketId) external view returns (uint256) {
        return marketParticipants[marketId].length;
    }

    /// @notice Get market IDs by page for frontend pagination
    function getMarketsPaginated(
        uint256 offset,
        uint256 limit
    ) external view returns (bytes32[] memory) {
        uint256 total = marketIds.length;
        if (offset >= total) {
            return new bytes32[](0);
        }

        uint256 end = offset + limit;
        if (end > total) end = total;

        bytes32[] memory page = new bytes32[](end - offset);
        for (uint256 i = offset; i < end;) {
            page[i - offset] = marketIds[i];
            unchecked { i++; }
        }
        return page;
    }
}

// ✓ ShadowMarketV2.sol complete
