// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.28;

/**
 * @title CommonOwnershipSlot
 * @notice Harberger-style ad slot variant where only a fraction of the valuation is bonded on-chain.
 */
contract CommonOwnershipSlot {
    uint256 private constant RATE_DENOMINATOR = 1e4; // basis points (10000 = 100%)
    uint256 private constant SECONDS_PER_YEAR = 365 days;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private constant TAX_BASE = RATE_DENOMINATOR * SECONDS_PER_YEAR;

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

    event SlotClaimed(address indexed newOwner, uint256 valuation, uint256 lockedAmount, uint256 paidThrough);
    event SlotTakenOver(
        address indexed previousOwner,
        address indexed newOwner,
        uint256 newValuation,
        uint256 lockedAmount,
        uint256 paidThrough
    );
    event SlotRenewed(address indexed owner, uint256 paidThrough);
    event SlotForfeited(address indexed previousOwner);
    event SlotReset(address indexed previousOwner);
    event AdCreativeUpdated(address indexed owner, string uri);
    event SlotPoked(address indexed operator, uint256 taxPaidUntil, uint256 valuationAfter);

    address public immutable treasury;
    address public immutable governance;
    address public immutable factory;

    uint256 public immutable bondRate;
    uint256 public immutable contentUpdateLimit;
    uint256 public immutable taxPeriodInSeconds;
    uint256 public immutable annualTaxRate;
    uint256 public immutable minBidIncrementRate;
    uint256 public immutable minValuation;
    uint256 public immutable dustRate;

    address public currentOwner;
    uint256 public valuation;
    uint256 public lockedValuation;
    uint256 public baseValuation;
    uint256 public taxPaidUntil;
    uint256 public contentUpdateCount;
    string public currentAdURI;

    uint256 private _status;

    struct SlotDetails {
        address currentOwner;
        uint256 valuation;
        uint256 lockedValuation;
        uint256 taxPaidUntil;
        uint256 timeRemainingInSeconds;
        uint256 contentUpdateCount;
        uint256 contentUpdateLimit;
        uint256 taxPeriodInSeconds;
        uint256 annualTaxRate;
        uint256 minBidIncrementRate;
        uint256 bondRate;
        uint256 minValuation;
        uint256 baseValuation;
        uint256 dustRate;
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
        uint256 minValuation_,
        uint256 dustRate_
    ) {
        if (treasury_ == address(0) || governance_ == address(0)) revert InvalidParameter();
        if (taxPeriodInSeconds_ == 0 || annualTaxRate_ == 0) revert InvalidParameter();
        if (bondRate_ == 0 || bondRate_ > RATE_DENOMINATOR) revert InvalidParameter();
        if (minValuation_ == 0) revert InvalidParameter();
        if (dustRate_ > RATE_DENOMINATOR) revert InvalidParameter();

        treasury = treasury_;
        governance = governance_;
        factory = msg.sender;
        bondRate = bondRate_;
        contentUpdateLimit = contentUpdateLimit_;
        taxPeriodInSeconds = taxPeriodInSeconds_;
        annualTaxRate = annualTaxRate_;
        minBidIncrementRate = minBidIncrementRate_;
        minValuation = minValuation_;
        dustRate = dustRate_;
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

        uint256 lockedAmount = _calculateLockedAmount(newValuation);
        uint256 taxDue = _calculateTax(newValuation, taxPeriods);
        if (taxDue == 0) revert InvalidParameter();

        uint256 requiredValue = lockedAmount + taxDue;
        if (msg.value != requiredValue) revert InvalidAmount();

        uint256 coverage = taxPeriodInSeconds * taxPeriods;

        lockedValuation = lockedAmount;
        valuation = newValuation;
        baseValuation = newValuation;
        currentOwner = msg.sender;
        taxPaidUntil = block.timestamp + coverage;
        contentUpdateCount = 0;
        currentAdURI = newUri;

        _forwardToTreasury(taxDue);

        emit SlotClaimed(msg.sender, newValuation, lockedAmount, taxPaidUntil);
    }

    function takeOver(uint256 newValuation, uint256 taxPeriods, string calldata newUri)
        external
        payable
        nonReentrant
    {
        address previousOwner = currentOwner;
        if (previousOwner == address(0)) revert SlotVacant();
        _settleOverdueTax();
        if (taxPeriods == 0 || newValuation == 0) revert InvalidParameter();
        if (newValuation < minValuation) revert InvalidParameter();

        uint256 minValuationRequired = valuation + ((valuation * minBidIncrementRate) / RATE_DENOMINATOR);
        if (newValuation < minValuationRequired) revert MinIncrementNotMet();

        uint256 lockedAmount = _calculateLockedAmount(newValuation);
        uint256 taxDue = _calculateTax(newValuation, taxPeriods);
        if (taxDue == 0) revert InvalidParameter();

        uint256 requiredValue = lockedAmount + taxDue;
        if (msg.value != requiredValue) revert InvalidAmount();

        uint256 payout = lockedValuation;
        uint256 coverage = taxPeriodInSeconds * taxPeriods;
        uint256 newPaidThrough = block.timestamp + coverage;

        currentOwner = msg.sender;
        valuation = newValuation;
        lockedValuation = lockedAmount;
        baseValuation = newValuation;
        taxPaidUntil = newPaidThrough;
        contentUpdateCount = 0;
        currentAdURI = newUri;

        _forwardToTreasury(taxDue);
        _sendValue(payable(previousOwner), payout);

        emit SlotTakenOver(previousOwner, msg.sender, newValuation, lockedAmount, newPaidThrough);
    }

    function renew(uint256 taxPeriods) external payable nonReentrant onlyOwner {
        if (taxPeriods == 0) revert InvalidParameter();
        _settleOverdueTax();

        uint256 taxDue = _calculateTax(valuation, taxPeriods);
        if (taxDue == 0) revert InvalidParameter();
        if (msg.value != taxDue) revert InvalidAmount();

        uint256 coverage = taxPeriodInSeconds * taxPeriods;
        taxPaidUntil = taxPaidUntil + coverage;

        _forwardToTreasury(taxDue);

        emit SlotRenewed(msg.sender, taxPaidUntil);
    }

    function forfeit() external nonReentrant {
        address previousOwner = currentOwner;
        if (previousOwner == address(0)) revert SlotVacant();
        _settleOverdueTax();
        if (block.timestamp < taxPaidUntil) revert TaxStillActive();

        uint256 payout = lockedValuation;

        currentOwner = address(0);
        valuation = 0;
        lockedValuation = 0;
        baseValuation = 0;
        taxPaidUntil = 0;
        contentUpdateCount = 0;
        currentAdURI = "";

        _sendValue(payable(previousOwner), payout);

        emit SlotForfeited(previousOwner);
    }

    function poke() external nonReentrant {
        address previousOwner = currentOwner;
        if (previousOwner == address(0)) revert SlotVacant();
        if (block.timestamp < taxPaidUntil) revert TaxStillActive();

        _settleOverdueTax();

        if (lockedValuation == 0) {
            currentOwner = address(0);
            valuation = 0;
            baseValuation = 0;
            taxPaidUntil = 0;
            contentUpdateCount = 0;
            currentAdURI = "";

            emit SlotForfeited(previousOwner);
        } else {
            emit SlotPoked(msg.sender, taxPaidUntil, valuation);
        }
    }

    function governanceReset() external nonReentrant onlyGovernance {
        address previousOwner = currentOwner;
        if (previousOwner == address(0)) revert SlotVacant();

        _settleOverdueTax();

        uint256 payout = lockedValuation;

        currentOwner = address(0);
        valuation = 0;
        lockedValuation = 0;
        baseValuation = 0;
        taxPaidUntil = 0;
        contentUpdateCount = 0;
        currentAdURI = "";

        _sendValue(payable(previousOwner), payout);

        emit SlotReset(previousOwner);
    }

    function updateAdCreative(string calldata newUri) external onlyOwner {
        if (contentUpdateCount >= contentUpdateLimit) revert ContentUpdateLimitReached();

        contentUpdateCount += 1;
        currentAdURI = newUri;

        emit AdCreativeUpdated(msg.sender, newUri);
    }

    function getSlotDetails() external view returns (SlotDetails memory details) {
        details = SlotDetails({
            currentOwner: currentOwner,
            valuation: valuation,
            lockedValuation: lockedValuation,
            taxPaidUntil: taxPaidUntil,
            timeRemainingInSeconds: block.timestamp >= taxPaidUntil
                ? 0
                : taxPaidUntil - block.timestamp,
            contentUpdateCount: contentUpdateCount,
            contentUpdateLimit: contentUpdateLimit,
            taxPeriodInSeconds: taxPeriodInSeconds,
            annualTaxRate: annualTaxRate,
            minBidIncrementRate: minBidIncrementRate,
            bondRate: bondRate,
            minValuation: minValuation,
            baseValuation: baseValuation,
            dustRate: dustRate,
            currentAdURI: currentAdURI,
            treasury: treasury,
            governance: governance,
            isOccupied: currentOwner != address(0)
        });
    }

    function _calculateTax(uint256 valuation_, uint256 periods) internal view returns (uint256) {
        uint256 numerator = valuation_ * annualTaxRate * taxPeriodInSeconds * periods;
        return numerator / TAX_BASE;
    }

    function _calculateLockedAmount(uint256 valuation_) internal view returns (uint256) {
        return (valuation_ * bondRate) / RATE_DENOMINATOR;
    }

    function _settleOverdueTax() private {
        if (currentOwner == address(0)) return;
        if (block.timestamp < taxPaidUntil) return;

        uint256 taxFactor = annualTaxRate * taxPeriodInSeconds;
        if (taxFactor == 0) return;

        uint256 taxDenominator = TAX_BASE + taxFactor;
        uint256 dustThresholdValuation;
        if (dustRate != 0 && baseValuation != 0) {
            dustThresholdValuation = (baseValuation * dustRate) / RATE_DENOMINATOR;
        }

        uint256 overdueSeconds = block.timestamp - taxPaidUntil;
        uint256 periodsDue = (overdueSeconds / taxPeriodInSeconds) + 1;
        uint256 taxAccrued;
        uint256 leftover;

        for (uint256 i = 0; i < periodsDue; ++i) {
            uint256 previousValuation = valuation;
            uint256 previousLocked = lockedValuation;

            if (previousValuation == 0 || previousLocked == 0) {
                valuation = 0;
                lockedValuation = 0;
                baseValuation = 0;
                taxPaidUntil = block.timestamp;
                break;
            }

            uint256 theoreticalValuation = (previousValuation * TAX_BASE) / taxDenominator;
            uint256 theoreticalTax = previousValuation - theoreticalValuation;
            uint256 taxPaid = theoreticalTax;
            uint256 newValuation = theoreticalValuation;

            if (taxPaid >= previousLocked) {
                taxPaid = previousLocked;
                newValuation = previousValuation > taxPaid ? previousValuation - taxPaid : 0;
            }

            taxAccrued += taxPaid;

            if (previousLocked <= taxPaid) {
                valuation = 0;
                lockedValuation = 0;
                baseValuation = 0;
                taxPaidUntil = block.timestamp;
                break;
            }

            uint256 remainingLocked = previousLocked - taxPaid;

            valuation = newValuation;
            lockedValuation = remainingLocked;
            taxPaidUntil += taxPeriodInSeconds;

            if (dustThresholdValuation != 0 && valuation <= dustThresholdValuation) {
                leftover += remainingLocked;
                valuation = 0;
                lockedValuation = 0;
                baseValuation = 0;
                taxPaidUntil = block.timestamp;
                break;
            }

            if (taxPaidUntil > block.timestamp) {
                break;
            }

            if (valuation == 0 || lockedValuation == 0) {
                leftover += lockedValuation;
                valuation = 0;
                lockedValuation = 0;
                baseValuation = 0;
                taxPaidUntil = block.timestamp;
                break;
            }
        }

        if (taxAccrued > 0) {
            _forwardToTreasury(taxAccrued);
        }

        if (leftover > 0 && currentOwner != address(0)) {
            _sendValue(payable(currentOwner), leftover);
        }
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
