// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Verifier.sol"; 

contract Roles {

    address public owner;
    UltraVerifier public verifier;

    bytes32 public constant FARMER = keccak256("FARMER");
    bytes32 public constant DISTRIBUTOR = keccak256("DISTRIBUTOR");
    bytes32 public constant MANUFACTURER = keccak256("MANUFACTURER");
    bytes32 public constant RETAILER = keccak256("RETAILER");

    mapping(bytes32 => bool) public validCommitments;

    event CommitmentAdded(bytes32 indexed commitment);
    event CommitmentDeleted(bytes32 indexed commitment);
    event ActionPerformed(bytes32 indexed commitment, bytes32 role);

    constructor(address _verifierAddress) {
        owner = msg.sender;
        verifier = UltraVerifier(_verifierAddress); 
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    function addEmployeeCommitment(bytes32 _commitment) external onlyOwner {
        require(_commitment != bytes32(0), "Invalid Commitment");
        validCommitments[_commitment] = true;
        emit CommitmentAdded(_commitment);
    }

    function removeEmployeeCommitment(bytes32 _commitment) external onlyOwner {
        require(validCommitments[_commitment], "Commitment not found");
        validCommitments[_commitment] = false;
        emit CommitmentDeleted(_commitment);
    }

    function proveRoleAndExecute(
        bytes calldata _proof,
        bytes32 _commitment,
        bytes32 _requiredRole
    ) external {
        require(validCommitments[_commitment], "Commitment not authorized");

        bytes32[] memory publicInputs = new bytes32[](2);
        publicInputs[0] = _commitment;
        publicInputs[1] = _requiredRole;

        bool isValid = verifier.verify(_proof, publicInputs);
        require(isValid, "Invalid ZK Proof!");

        emit ActionPerformed(_commitment, _requiredRole);
    }
}