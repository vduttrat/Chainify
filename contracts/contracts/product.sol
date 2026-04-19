// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Roles.sol";
import "./Verifier.sol"; 

contract product {

    Roles private roleContract;
    address private owner;

    constructor(address _productContract) {
        roleContract = Roles(_productContract);
        owner = msg.sender;
    }

    struct batch {
        uint256 id;
        string name;
        string location;
        uint256 time;
        uint256 quantity;
    }

    struct history {
        Stage currentStage;
        bool verified;
        uint256 timestamp;
        string cid; 
    }

    mapping(uint256 => batch) private batches;
    mapping(uint256 => history[]) private batchHistory;
    uint256[] public allProductIds;

    uint256 private nextId = 1001;

    enum Stage { CREATED, FARMER, DISTRIBUTOR, MANUFACTURER, RETAILER }

    event productAdded(uint256 id, string name, string location, uint256 time, uint256 quantity);

    function _verifyZKP(
        bytes calldata _proof, 
        bytes32 _commitment, 
        bytes32 _requiredRole
    ) internal view {
        require(roleContract.validCommitments(_commitment), "Commitment not authorized");

        bytes32[] memory publicInputs = new bytes32[](2);
        publicInputs[0] = _commitment;
        publicInputs[1] = _requiredRole;

        require(roleContract.verifier().verify(_proof, publicInputs), "Invalid ZK Proof");
    }

    function addProduct(
        string memory _name,
        string memory _location,
        uint256 _quantity,
        string memory _cid,
        bytes calldata _proof,
        bytes32 _commitment
    ) external {
        _verifyZKP(_proof, _commitment, roleContract.FARMER());

        require(_quantity > 0, "Quantity must be greater than zero");
        require(bytes(_cid).length > 0, "CID required");

        batches[nextId] = batch(
            nextId,
            _name,
            _location,
            block.timestamp,
            _quantity
        );

        batchHistory[nextId].push(
            history(Stage.CREATED, true, block.timestamp, _cid)
        );

        allProductIds.push(nextId);
        emit productAdded(nextId, _name, _location, block.timestamp, _quantity);

        nextId++;
    }

    function getAllProductIds() external view returns (uint256[] memory) {
        return allProductIds;
    }

    function updateHistory(
        uint256 _batchId,
        bool _verified,
        string memory _cid,
        bytes calldata _proof,
        bytes32 _commitment
    ) external {
        require(bytes(_cid).length > 0, "CID cannot be empty");
        require(batches[_batchId].id != 0, "Batch does not exist");

        history[] storage h = batchHistory[_batchId];

        Stage nextStage = Stage(uint(h[h.length - 1].currentStage) + 1);

        require(uint(nextStage) <= uint(Stage.RETAILER), "Final stage reached");

        if (nextStage == Stage.FARMER) {
            _verifyZKP(_proof, _commitment, roleContract.FARMER());
        } 
        else if (nextStage == Stage.DISTRIBUTOR) {
            _verifyZKP(_proof, _commitment, roleContract.DISTRIBUTOR());
        } 
        else if (nextStage == Stage.MANUFACTURER) {
            _verifyZKP(_proof, _commitment, roleContract.MANUFACTURER());
        } 
        else if (nextStage == Stage.RETAILER) {
            _verifyZKP(_proof, _commitment, roleContract.RETAILER());
        }

        h.push(history(nextStage, _verified, block.timestamp, _cid));
    }

    function getHistory(uint256 _id) external view returns (history[] memory) {
        return batchHistory[_id];
    }

    function getProduct(uint256 _id) external view returns (batch memory) {
        return batches[_id];
    }
}