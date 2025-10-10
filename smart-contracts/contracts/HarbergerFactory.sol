// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.28;

import {ValuationTaxEnabledSlot} from "./ValuationTaxEnabledSlot.sol";
import {ValuationTaxShieldedSlot} from "./ValuationTaxShieldedSlot.sol";

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
        ValuationTaxEnabled,
        ValuationTaxShielded
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
    address[] private _valuationTaxEnabledSlots;
    address[] private _valuationTaxShieldedSlots;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event GlobalAddressesConfigured(address indexed treasury, address indexed governance);
    event ValuationTaxEnabledSlotCreated(uint256 indexed slotId, address slotAddress);
    event ValuationTaxShieldedSlotCreated(uint256 indexed slotId, address slotAddress);

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

    function createValuationTaxEnabledSlot(
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

        ValuationTaxEnabledSlot slotInstance = new ValuationTaxEnabledSlot(
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
        _slots[slotId] = SlotInfo({slotAddress: slotAddress, slotType: SlotType.ValuationTaxEnabled});
        slotTypeByAddress[slotAddress] = SlotType.ValuationTaxEnabled;
        _valuationTaxEnabledSlots.push(slotAddress);

        emit ValuationTaxEnabledSlotCreated(slotId, slotAddress);
    }

    function createValuationTaxShieldedSlot(
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

        ValuationTaxShieldedSlot slotInstance = new ValuationTaxShieldedSlot(
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
        _slots[slotId] = SlotInfo({slotAddress: slotAddress, slotType: SlotType.ValuationTaxShielded});
        slotTypeByAddress[slotAddress] = SlotType.ValuationTaxShielded;
        _valuationTaxShieldedSlots.push(slotAddress);

        emit ValuationTaxShieldedSlotCreated(slotId, slotAddress);
    }

    function getSlot(uint256 slotId) external view returns (SlotInfo memory info) {
        info = _slots[slotId];
        if (info.slotAddress == address(0)) revert SlotDoesNotExist();
    }

    function getValuationTaxEnabledSlots() external view returns (address[] memory slots_) {
        slots_ = _valuationTaxEnabledSlots;
    }

    function getValuationTaxShieldedSlots() external view returns (address[] memory slots_) {
        slots_ = _valuationTaxShieldedSlots;
    }
}
