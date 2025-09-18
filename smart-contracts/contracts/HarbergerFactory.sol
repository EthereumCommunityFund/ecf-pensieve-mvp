// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.28;

import {ClassicalSlot} from "./ClassicalSlot.sol";
import {CommonOwnershipSlot} from "./CommonOwnershipSlot.sol";
import {SacredBondSlot} from "./SacredBondSlot.sol";

/**
 * @title HarbergerFactory
 * @notice Deploys Harberger ad slots and tracks their metadata.
 */
contract HarbergerFactory {
    uint256 private constant RATE_DENOMINATOR = 1e4; // basis points

    error Unauthorized();
    error InvalidParameter();
    error GlobalAddressesUnset();
    error SlotDoesNotExist();
    error NoPendingOwner();

    enum SlotType {
        Unknown,
        Classical,
        CommonOwnership,
        SacredBond
    }

    struct SlotInfo {
        address slotAddress;
        SlotType slotType;
    }

    address public owner;
    address public pendingOwner;
    address public treasury;
    address public governance;

    uint256 public slotIdCounter;

    mapping(uint256 => SlotInfo) private _slots;
    mapping(address => SlotType) public slotTypeByAddress;
    address[] private _classicalSlots;
    address[] private _commonOwnershipSlots;
    address[] private _sacredBondSlots;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event GlobalAddressesConfigured(address indexed treasury, address indexed governance);
    event ClassicalSlotCreated(uint256 indexed slotId, address slotAddress);
    event CommonOwnershipSlotCreated(uint256 indexed slotId, address slotAddress);
    event SacredBondSlotCreated(uint256 indexed slotId, address slotAddress);

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor(address treasury_, address governance_) {
        owner = msg.sender;
        if (treasury_ != address(0) && governance_ != address(0)) {
            treasury = treasury_;
            governance = governance_;
            emit GlobalAddressesConfigured(treasury_, governance_);
        }
    }

    function setGlobalAddresses(address treasury_, address governance_) external onlyOwner {
        if (treasury_ == address(0) || governance_ == address(0)) revert InvalidParameter();
        treasury = treasury_;
        governance = governance_;
        emit GlobalAddressesConfigured(treasury_, governance_);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidParameter();
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    function acceptOwnership() external {
        address newOwner = pendingOwner;
        if (newOwner == address(0)) revert NoPendingOwner();
        if (msg.sender != newOwner) revert Unauthorized();
        address previousOwner = owner;
        owner = newOwner;
        pendingOwner = address(0);
        emit OwnershipTransferred(previousOwner, newOwner);
    }

    function createClassicalSlot(
        uint256 contentUpdateLimit,
        uint256 taxPeriodInSeconds,
        uint256 annualTaxRate,
        uint256 minBidIncrementRate,
        uint256 minValuation,
        uint256 dustRate
    ) external onlyOwner returns (uint256 slotId, address slotAddress) {
        if (treasury == address(0) || governance == address(0)) revert GlobalAddressesUnset();
        if (taxPeriodInSeconds == 0 || annualTaxRate == 0) revert InvalidParameter();
        if (minValuation == 0) revert InvalidParameter();

        slotId = ++slotIdCounter;

        ClassicalSlot slotInstance = new ClassicalSlot(
            treasury,
            governance,
            contentUpdateLimit,
            taxPeriodInSeconds,
            annualTaxRate,
            minBidIncrementRate,
            minValuation,
            dustRate
        );

        slotAddress = address(slotInstance);
        _slots[slotId] = SlotInfo({slotAddress: slotAddress, slotType: SlotType.Classical});
        slotTypeByAddress[slotAddress] = SlotType.Classical;
        _classicalSlots.push(slotAddress);

        emit ClassicalSlotCreated(slotId, slotAddress);
    }

    function createCommonOwnershipSlot(
        uint256 bondRate,
        uint256 contentUpdateLimit,
        uint256 taxPeriodInSeconds,
        uint256 annualTaxRate,
        uint256 minBidIncrementRate,
        uint256 minValuation,
        uint256 dustRate
    ) external onlyOwner returns (uint256 slotId, address slotAddress) {
        if (treasury == address(0) || governance == address(0)) revert GlobalAddressesUnset();
        if (taxPeriodInSeconds == 0 || annualTaxRate == 0) revert InvalidParameter();
        if (bondRate == 0 || bondRate > RATE_DENOMINATOR) revert InvalidParameter();
        if (minValuation == 0) revert InvalidParameter();
        if (dustRate > RATE_DENOMINATOR) revert InvalidParameter();

        slotId = ++slotIdCounter;

        CommonOwnershipSlot slotInstance = new CommonOwnershipSlot(
            treasury,
            governance,
            bondRate,
            contentUpdateLimit,
            taxPeriodInSeconds,
            annualTaxRate,
            minBidIncrementRate,
            minValuation,
            dustRate
        );

        slotAddress = address(slotInstance);
        _slots[slotId] = SlotInfo({slotAddress: slotAddress, slotType: SlotType.CommonOwnership});
        slotTypeByAddress[slotAddress] = SlotType.CommonOwnership;
        _commonOwnershipSlots.push(slotAddress);

        emit CommonOwnershipSlotCreated(slotId, slotAddress);
    }

    function createSacredBondSlot(
        uint256 bondRate,
        uint256 contentUpdateLimit,
        uint256 taxPeriodInSeconds,
        uint256 annualTaxRate,
        uint256 minBidIncrementRate,
        uint256 minValuation
    ) external onlyOwner returns (uint256 slotId, address slotAddress) {
        if (treasury == address(0) || governance == address(0)) revert GlobalAddressesUnset();
        if (taxPeriodInSeconds == 0 || annualTaxRate == 0) revert InvalidParameter();
        if (bondRate == 0 || bondRate > RATE_DENOMINATOR) revert InvalidParameter();
        if (minValuation == 0) revert InvalidParameter();

        slotId = ++slotIdCounter;

        SacredBondSlot slotInstance = new SacredBondSlot(
            treasury,
            governance,
            bondRate,
            contentUpdateLimit,
            taxPeriodInSeconds,
            annualTaxRate,
            minBidIncrementRate,
            minValuation
        );

        slotAddress = address(slotInstance);
        _slots[slotId] = SlotInfo({slotAddress: slotAddress, slotType: SlotType.SacredBond});
        slotTypeByAddress[slotAddress] = SlotType.SacredBond;
        _sacredBondSlots.push(slotAddress);

        emit SacredBondSlotCreated(slotId, slotAddress);
    }

    function getSlot(uint256 slotId) external view returns (SlotInfo memory info) {
        info = _slots[slotId];
        if (info.slotAddress == address(0)) revert SlotDoesNotExist();
    }

    function getClassicalSlots() external view returns (address[] memory slots_) {
        slots_ = _classicalSlots;
    }

    function getCommonOwnershipSlots() external view returns (address[] memory slots_) {
        slots_ = _commonOwnershipSlots;
    }

    function getSacredBondSlots() external view returns (address[] memory slots_) {
        slots_ = _sacredBondSlots;
    }
}
