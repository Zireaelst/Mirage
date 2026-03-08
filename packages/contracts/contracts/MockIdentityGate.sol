// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MockIdentityGate
/// @notice A mock identity gate for demo purposes that lets anyone verify
contract MockIdentityGate {
    mapping(address => bool) public verifiedUsers;
    uint256 public verifiedCount;

    event UserVerified(address indexed user, uint256 indexed nullifierHash);

    function verifyAndRegister(
        uint256 /*root*/,
        uint256 /*signalHash*/,
        uint256 nullifierHash,
        uint256 /*externalNullifierHash*/,
        uint256[8] calldata /*proof*/
    ) external {
        if (!verifiedUsers[msg.sender]) {
            verifiedUsers[msg.sender] = true;
            verifiedCount++;
            emit UserVerified(msg.sender, nullifierHash);
        }
    }

    function isVerified(address user) external view returns (bool) {
        return verifiedUsers[user];
    }
}
