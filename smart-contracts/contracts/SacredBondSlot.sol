// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.28;

/**
 * @title SacredBondSlot
 * @notice Harberger-style slot where only a bonded fraction of the valuation is escrowed and refunded when coverage lapses.
 */
contract SacredBondSlot {
    uint256 private constant RATE_DENOMINATOR = 1e4; // basis points (10000 = 100%)
    uint256 private constant SECONDS_PER_YEAR = 365 days;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    error Unauthorized();
    error SlotOccupied();
    error SlotVacant();
    error InvalidAmount();
    error InvalidParameter();
    error ContentUpdateLimitReached();
    error TaxStillActive();
    error MinIncrementNotMet();
    error TransferFailed();
    error Reentrancy();

    event SlotClaimed(address indexed newOwner, uint256 valuation, uint256 bondedAmount, uint256 paidThrough);
    event SlotTakenOver(
        address indexed previousOwner,
        address indexed newOwner,
        uint256 newValuation,
        uint256 bondedAmount,
        uint256 paidThrough
    );
    event SlotRenewed(address indexed owner, uint256 paidThrough);
    event SlotForfeited(address indexed previousOwner);
    event SlotReset(address indexed previousOwner);
    event SlotExpired(address indexed previousOwner);
    event SlotPoked(address indexed operator);
    event AdCreativeUpdated(address indexed owner, string uri);

    address public immutable treasury;
    address public immutable governance;
    address public immutable factory;

    uint256 public immutable bondRate;
    uint256 public immutable contentUpdateLimit;
    uint256 public immutable taxPeriodInSeconds;
    uint256 public immutable annualTaxRate;
    uint256 public immutable minBidIncrementRate;
    uint256 public immutable minValuation;

    address public currentOwner;
    uint256 public valuation;
    uint256 public bondedAmount;
    uint256 public taxPaidUntil;
    uint256 public contentUpdateCount;
    string public currentAdURI;

    uint256 private _status;

    struct SlotDetails {
        address currentOwner;
        uint256 valuation;
        uint256 bondedAmount;
        uint256 taxPaidUntil;
        uint256 timeRemainingInSeconds;
        bool isExpired;
        uint256 contentUpdateCount;
        uint256 contentUpdateLimit;
        uint256 taxPeriodInSeconds;
        uint256 annualTaxRate;
        uint256 minBidIncrementRate;
        uint256 bondRate;
        uint256 minValuation;
        string currentAdURI;
        address treasury;
        address governance;
        bool isOccupied;
    }

    constructor(
        address treasury_,
        address governance_,
        uint256 bondRate_,
        uint256 contentUpdateLimit_,
        uint256 taxPeriodInSeconds_,
        uint256 annualTaxRate_,
        uint256 minBidIncrementRate_,
        uint256 minValuation_
    ) {
        if (treasury_ == address(0) || governance_ == address(0)) revert InvalidParameter();
        if (taxPeriodInSeconds_ == 0 || annualTaxRate_ == 0) revert InvalidParameter();
        if (bondRate_ == 0 || bondRate_ > RATE_DENOMINATOR) revert InvalidParameter();
        if (minValuation_ == 0) revert InvalidParameter();

        treasury = treasury_;
        governance = governance_;
        factory = msg.sender;
        bondRate = bondRate_;
        contentUpdateLimit = contentUpdateLimit_;
        taxPeriodInSeconds = taxPeriodInSeconds_;
        annualTaxRate = annualTaxRate_;
        minBidIncrementRate = minBidIncrementRate_;
        minValuation = minValuation_;
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        if (_status == _ENTERED) revert Reentrancy();
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    modifier onlyOwner() {
        if (msg.sender != currentOwner) revert Unauthorized();
        _;
    }

    modifier onlyGovernance() {
        if (msg.sender != governance) revert Unauthorized();
        _;
    }

    function claim(uint256 newValuation, uint256 taxPeriods, string calldata newUri)
        external
        payable
        nonReentrant
    {
        if (currentOwner != address(0)) revert SlotOccupied();
        if (newValuation == 0 || taxPeriods == 0) revert InvalidParameter();
        if (newValuation < minValuation) revert InvalidParameter();

        uint256 bondRequired = _calculateBond(newValuation);
        uint256 taxDue = _calculateTax(newValuation, taxPeriods);
        if (taxDue == 0) revert InvalidParameter();

        uint256 requiredValue = bondRequired + taxDue;
        if (msg.value != requiredValue) revert InvalidAmount();

        uint256 coverage = taxPeriodInSeconds * taxPeriods;

        currentOwner = msg.sender;
        valuation = newValuation;
        bondedAmount = bondRequired;
        taxPaidUntil = block.timestamp + coverage;
        contentUpdateCount = 0;
        currentAdURI = newUri;

        _forwardToTreasury(taxDue);

        emit SlotClaimed(msg.sender, newValuation, bondRequired, taxPaidUntil);
    }

    function takeOver(uint256 newValuation, uint256 taxPeriods, string calldata newUri)
        external
        payable
        nonReentrant
    {
        _expireIfNeeded();

        address previousOwner = currentOwner;
        if (previousOwner == address(0)) revert SlotVacant();
        if (taxPeriods == 0 || newValuation == 0) revert InvalidParameter();
        if (newValuation < minValuation) revert InvalidParameter();

        uint256 minValuationRequired = valuation + ((valuation * minBidIncrementRate) / RATE_DENOMINATOR);
        if (newValuation < minValuationRequired) revert MinIncrementNotMet();

        uint256 bondRequired = _calculateBond(newValuation);
        uint256 taxDue = _calculateTax(newValuation, taxPeriods);
        if (taxDue == 0) revert InvalidParameter();

        uint256 requiredValue = bondRequired + taxDue;
        if (msg.value != requiredValue) revert InvalidAmount();

        uint256 payout = bondedAmount;
        uint256 coverage = taxPeriodInSeconds * taxPeriods;
        uint256 paidThrough = block.timestamp + coverage;

        currentOwner = msg.sender;
        valuation = newValuation;
        bondedAmount = bondRequired;
        taxPaidUntil = paidThrough;
        contentUpdateCount = 0;
        currentAdURI = newUri;

        _forwardToTreasury(taxDue);
        if (payout > 0) {
            _sendValue(payable(previousOwner), payout);
        }

        emit SlotTakenOver(previousOwner, msg.sender, newValuation, bondRequired, paidThrough);
    }

    function renew(uint256 taxPeriods) external payable nonReentrant onlyOwner {
        _expireIfNeeded();

        if (currentOwner == address(0)) revert SlotVacant();
        if (taxPeriods == 0) revert InvalidParameter();

        uint256 taxDue = _calculateTax(valuation, taxPeriods);
        if (taxDue == 0) revert InvalidParameter();
        if (msg.value != taxDue) revert InvalidAmount();

        uint256 coverage = taxPeriodInSeconds * taxPeriods;
        taxPaidUntil = taxPaidUntil + coverage;

        _forwardToTreasury(taxDue);

        emit SlotRenewed(msg.sender, taxPaidUntil);
    }

    function forfeit() external nonReentrant onlyOwner {
        _expireIfNeeded();

        address previousOwner = currentOwner;
        if (previousOwner == address(0)) revert SlotVacant();
        if (block.timestamp >= taxPaidUntil) revert TaxStillActive();

        uint256 payout = bondedAmount;

        currentOwner = address(0);
        valuation = 0;
        bondedAmount = 0;
        taxPaidUntil = 0;
        contentUpdateCount = 0;
        currentAdURI = "";

        if (payout > 0) {
            _sendValue(payable(previousOwner), payout);
        }

        emit SlotForfeited(previousOwner);
    }

    function governanceReset() external nonReentrant onlyGovernance {
        _expireIfNeeded();

        address previousOwner = currentOwner;
        if (previousOwner == address(0)) revert SlotVacant();

        uint256 payout = bondedAmount;

        currentOwner = address(0);
        valuation = 0;
        bondedAmount = 0;
        taxPaidUntil = 0;
        contentUpdateCount = 0;
        currentAdURI = "";

        if (payout > 0) {
            _sendValue(payable(previousOwner), payout);
        }

        emit SlotReset(previousOwner);
    }

    function poke() external nonReentrant {
        if (currentOwner == address(0)) revert SlotVacant();
        if (block.timestamp < taxPaidUntil) revert TaxStillActive();

        _expireIfNeeded();

        emit SlotPoked(msg.sender);
    }

    function updateAdCreative(string calldata newUri) external onlyOwner {
        if (contentUpdateCount >= contentUpdateLimit) revert ContentUpdateLimitReached();

        contentUpdateCount += 1;
        currentAdURI = newUri;

        emit AdCreativeUpdated(msg.sender, newUri);
    }

    function getSlotDetails() external view returns (SlotDetails memory details) {
        bool expired = currentOwner != address(0) && block.timestamp >= taxPaidUntil;
        uint256 timeRemaining = expired
            ? 0
            : (taxPaidUntil > block.timestamp ? taxPaidUntil - block.timestamp : 0);

        details = SlotDetails({
            currentOwner: currentOwner,
            valuation: valuation,
            bondedAmount: bondedAmount,
            taxPaidUntil: taxPaidUntil,
            timeRemainingInSeconds: timeRemaining,
            isExpired: expired,
            contentUpdateCount: contentUpdateCount,
            contentUpdateLimit: contentUpdateLimit,
            taxPeriodInSeconds: taxPeriodInSeconds,
            annualTaxRate: annualTaxRate,
            minBidIncrementRate: minBidIncrementRate,
            bondRate: bondRate,
            minValuation: minValuation,
            currentAdURI: currentAdURI,
            treasury: treasury,
            governance: governance,
            isOccupied: currentOwner != address(0)
        });
    }

    function _expireIfNeeded() private {
        if (currentOwner == address(0)) return;
        if (block.timestamp < taxPaidUntil) return;

        address previousOwner = currentOwner;
        uint256 payout = bondedAmount;

        currentOwner = address(0);
        valuation = 0;
        bondedAmount = 0;
        taxPaidUntil = 0;
        contentUpdateCount = 0;
        currentAdURI = "";

        if (payout > 0) {
            _sendValue(payable(previousOwner), payout);
        }

        emit SlotExpired(previousOwner);
    }

    function _calculateTax(uint256 valuation_, uint256 periods) internal view returns (uint256) {
        uint256 numerator = valuation_ * annualTaxRate * taxPeriodInSeconds * periods;
        return numerator / (RATE_DENOMINATOR * SECONDS_PER_YEAR);
    }

    function _calculateBond(uint256 valuation_) internal view returns (uint256) {
        return (valuation_ * bondRate) / RATE_DENOMINATOR;
    }

    function _forwardToTreasury(uint256 amount) private {
        _sendValue(payable(treasury), amount);
    }

    function _sendValue(address payable to, uint256 amount) private {
        (bool success, ) = to.call{value: amount}("");
        if (!success) revert TransferFailed();
    }

    receive() external payable {
        revert InvalidAmount();
    }

    fallback() external payable {
        revert InvalidAmount();
    }
}
