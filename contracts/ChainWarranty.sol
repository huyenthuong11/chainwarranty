// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract ChainWarranty is AccessControl {
    bytes32 public constant MANUFACTURER_ROLE =
        keccak256("MANUFACTURER_ROLE");
    
    struct Product {
        string productId;
        string name;
        string model;
        address owner;
        address manufacturer;
        uint256 registeredAt;
        uint256 warrantyStart;
        uint256 warrantyEnd;
        string imageCID;
        bool exists;
    }

    struct OwnershipRecord {
        address owner;
        uint256 transferredAt;
    }

    mapping(string => Product) private products;
    mapping(string => OwnershipRecord[]) private ownershipHistory;

    event ProductRegistered(
        string indexed productId,
        address indexed manufacturer
    );

    event OwnershipTransferred(
        string indexed productId,
        address indexed previousOwner,
        address indexed newOwner
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function addManufacturer(
        address manufacturer
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MANUFACTURER_ROLE, manufacturer);
    }

    function removeManufacturer(
        address manufacturer
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(MANUFACTURER_ROLE, manufacturer);
    }

    function registerProduct(
        string memory productId,
        string memory name,
        string memory model,
        string memory imageCID
    ) external onlyRole(MANUFACTURER_ROLE) {
        require(bytes(productId).length > 0, "Product ID is required");
        require(!products[productId].exists, "Product already exists");

        products[productId] = Product({
            productId: productId,
            name: name,
            model: model,
            owner: msg.sender,
            manufacturer: msg.sender,
            registeredAt: block.timestamp,
            warrantyStart: 0,
            warrantyEnd: 0,
            imageCID: imageCID,
            exists: true
        });

        ownershipHistory[productId].push(
            OwnershipRecord({
                owner: msg.sender,
                transferredAt: block.timestamp
            })
        );

        emit ProductRegistered(productId, msg.sender);
    }

    event WarrantyIssued(
        string indexed productId,
        uint256 warrantyStart,
        uint256 warrantyEnd
    );

    function issueWarranty(
        string memory productId,
        uint256 warrantyStart,
        uint256 warrantyEnd
    ) external onlyRole(MANUFACTURER_ROLE) {
        require(products[productId].exists, "Product not found");
        require(
            products[productId].manufacturer == msg.sender,
            "Not the product manufacturer"
        );
        uint256 start = warrantyStart == 0
            ? block.timestamp
            : warrantyStart;

        require(warrantyEnd > start, "Invalid warranty period");

        products[productId].warrantyStart = start;
        products[productId].warrantyEnd = warrantyEnd;

        emit WarrantyIssued(productId, start, warrantyEnd);
    }

    function getProduct(
        string memory productId
    ) external view returns (Product memory) {
        require(products[productId].exists, "Product not found");

        return products[productId];
    }

    function transferOwnership(
        string memory productId,
        address newOwner
    ) external {
        require(products[productId].exists, "Product not found");
        require(
            products[productId].owner == msg.sender,
            "Not the owner"
        );
        require(newOwner != address(0), "Invalid new owner");
        require(newOwner != msg.sender, "Already the owner");

        address previousOwner = products[productId].owner;

        products[productId].owner = newOwner;

        ownershipHistory[productId].push(
            OwnershipRecord({
                owner: newOwner,
                transferredAt: block.timestamp
            })
        );

        emit OwnershipTransferred(
            productId,
            previousOwner,
            newOwner
        );
    }

    function getOwnershipHistory(
        string memory productId
    ) external view returns (OwnershipRecord[] memory) {
        require(products[productId].exists, "Product not found");
        return ownershipHistory[productId];
    }

    function verifyWarranty(
        string memory productId
    ) external view returns (
        bool valid,
        uint256 warrantyStart,
        uint256 warrantyEnd
    ) {
        require(products[productId].exists, "Product not found");

        warrantyStart = products[productId].warrantyStart;
        warrantyEnd = products[productId].warrantyEnd;

        valid =
            warrantyStart > 0 &&
            warrantyEnd > warrantyStart &&
            block.timestamp >= warrantyStart &&
            block.timestamp <= warrantyEnd;
    }
}



