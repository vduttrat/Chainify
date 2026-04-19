// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Verifier.sol"; 

contract Roles {

    address public owner;
    IVerifier public verifier;

    struct CompanyProfile {
        string name;
        string description;
        string logo;
        bool initialized;
    }

    struct Employee {
        bytes32 commitment;
        address wallet;
        string role;
        bool isActive;
    }

    mapping(address => CompanyProfile) public companyProfiles;
    Employee[] public employees;
    mapping(bytes32 => uint256) public commitmentToIndex; // mapping commitment to index in employees array + 1

    bytes32 public constant FARMER = keccak256("FARMER");
    bytes32 public constant DISTRIBUTOR = keccak256("DISTRIBUTOR");
    bytes32 public constant MANUFACTURER = keccak256("MANUFACTURER");
    bytes32 public constant RETAILER = keccak256("RETAILER");

    mapping(bytes32 => bool) public validCommitments;

    event CommitmentAdded(bytes32 indexed commitment);
    event CommitmentDeleted(bytes32 indexed commitment);
    event ActionPerformed(bytes32 indexed commitment, bytes32 role);
    event CompanyProfileUpdated(address indexed company, string name);

    constructor(address _verifierAddress) {
        owner = msg.sender;
        verifier = IVerifier(_verifierAddress); 
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    function setCompanyProfile(string memory _name, string memory _description, string memory _logo) external {
        companyProfiles[msg.sender] = CompanyProfile(_name, _description, _logo, true);
        emit CompanyProfileUpdated(msg.sender, _name);
    }

    function addEmployeeCommitment(bytes32 _commitment, address _wallet, string memory _role) external onlyOwner {
        require(_commitment != bytes32(0), "Invalid Commitment");
        require(!validCommitments[_commitment], "Already exists");
        
        validCommitments[_commitment] = true;
        employees.push(Employee(_commitment, _wallet, _role, true));
        commitmentToIndex[_commitment] = employees.length;
        
        emit CommitmentAdded(_commitment);
    }

    function removeEmployeeCommitment(bytes32 _commitment) external onlyOwner {
        require(validCommitments[_commitment], "Commitment not found");
        validCommitments[_commitment] = false;
        
        uint256 index = commitmentToIndex[_commitment] - 1;
        employees[index].isActive = false;
        
        emit CommitmentDeleted(_commitment);
    }

    function getEmployees() external view returns (Employee[] memory) {
        return employees;
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