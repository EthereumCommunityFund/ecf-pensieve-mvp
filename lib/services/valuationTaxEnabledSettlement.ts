const RATE_DENOMINATOR = 10_000n;
const SECONDS_PER_YEAR = 365n * 24n * 60n * 60n;
const TAX_BASE = RATE_DENOMINATOR * SECONDS_PER_YEAR;

export interface ValuationTaxEnabledState {
  currentOwner: `0x${string}` | string;
  valuation: bigint;
  lockedValuation: bigint;
  baseValuation: bigint;
  prepaidTaxBalance: bigint;
  taxPaidUntil: bigint;
  taxPeriodInSeconds: bigint;
  annualTaxRate: bigint;
  dustRate: bigint;
}

export interface SettlementResult {
  state: ValuationTaxEnabledState;
  taxAccrued: bigint;
  ownerRefund: bigint;
  periodsProcessed: number;
}

export interface DepletionSimulationOptions {
  maxIterations?: number;
  startTimestamp?: bigint;
}

export interface DepletionSimulationResult {
  depleted: boolean;
  iterations: number;
  state: ValuationTaxEnabledState;
  taxAccrued: bigint;
  ownerRefund: bigint;
}

function cloneState(state: ValuationTaxEnabledState): ValuationTaxEnabledState {
  return {
    currentOwner: state.currentOwner,
    valuation: state.valuation,
    lockedValuation: state.lockedValuation,
    baseValuation: state.baseValuation,
    prepaidTaxBalance: state.prepaidTaxBalance,
    taxPaidUntil: state.taxPaidUntil,
    taxPeriodInSeconds: state.taxPeriodInSeconds,
    annualTaxRate: state.annualTaxRate,
    dustRate: state.dustRate,
  };
}

function setToZero(state: ValuationTaxEnabledState) {
  state.valuation = 0n;
  state.lockedValuation = 0n;
  state.baseValuation = 0n;
  state.taxPaidUntil = 0n;
}

export function simulateValuationTaxEnabledSettlement(
  originalState: ValuationTaxEnabledState,
  blockTimestamp: bigint,
): SettlementResult {
  const state = cloneState(originalState);
  let taxAccrued = 0n;
  let ownerRefund = 0n;
  let iterations = 0;

  const taxFactor = state.annualTaxRate * state.taxPeriodInSeconds;

  const taxDenominator = TAX_BASE + taxFactor;
  let dustThresholdValuation = 0n;
  if (state.dustRate !== 0n && state.baseValuation !== 0n) {
    dustThresholdValuation =
      (state.baseValuation * state.dustRate) / RATE_DENOMINATOR;
  }

  for (let i = 0; i < 1; i += 1) {
    iterations += 1;

    const previousValuation = state.valuation;
    const previousLocked = state.lockedValuation;

    if (previousValuation === 0n || previousLocked === 0n) {
      if (state.prepaidTaxBalance > 0n) {
        ownerRefund += state.prepaidTaxBalance;
        state.prepaidTaxBalance = 0n;
      }
      setToZero(state);
      state.taxPaidUntil = blockTimestamp;
      break;
    }

    const theoreticalValuation =
      (previousValuation * TAX_BASE) / taxDenominator;
    const theoreticalTax = previousValuation - theoreticalValuation;
    let taxRemaining = theoreticalTax;

    if (state.prepaidTaxBalance > 0n) {
      const taxFromPrepaid =
        state.prepaidTaxBalance >= taxRemaining
          ? taxRemaining
          : state.prepaidTaxBalance;
      state.prepaidTaxBalance -= taxFromPrepaid;
      taxRemaining -= taxFromPrepaid;
      taxAccrued += taxFromPrepaid;
    }

    let taxFromLocked = 0n;
    if (taxRemaining > 0n) {
      if (taxRemaining >= previousLocked) {
        taxFromLocked = previousLocked;
        taxRemaining -= previousLocked;
      } else {
        taxFromLocked = taxRemaining;
        taxRemaining = 0n;
      }
      taxAccrued += taxFromLocked;
    }

    if (taxFromLocked >= previousLocked) {
      setToZero(state);
      state.taxPaidUntil = blockTimestamp;
      if (state.prepaidTaxBalance > 0n) {
        ownerRefund += state.prepaidTaxBalance;
        state.prepaidTaxBalance = 0n;
      }
      break;
    }

    const newValuation =
      taxRemaining === 0n
        ? theoreticalValuation
        : previousValuation > taxFromLocked
          ? previousValuation - taxFromLocked
          : 0n;
    const remainingLocked = previousLocked - taxFromLocked;

    state.valuation = newValuation;
    state.lockedValuation = remainingLocked;
    state.taxPaidUntil += state.taxPeriodInSeconds;

    if (
      dustThresholdValuation !== 0n &&
      newValuation <= dustThresholdValuation
    ) {
      ownerRefund += remainingLocked;
      setToZero(state);
      state.taxPaidUntil = blockTimestamp;
      if (state.prepaidTaxBalance > 0n) {
        ownerRefund += state.prepaidTaxBalance;
        state.prepaidTaxBalance = 0n;
      }
      break;
    }

    if (state.taxPaidUntil > blockTimestamp) {
      break;
    }

    if (state.valuation === 0n || state.lockedValuation === 0n) {
      ownerRefund += state.lockedValuation;
      setToZero(state);
      state.taxPaidUntil = blockTimestamp;
      if (state.prepaidTaxBalance > 0n) {
        ownerRefund += state.prepaidTaxBalance;
        state.prepaidTaxBalance = 0n;
      }
      break;
    }
  }

  return { state, taxAccrued, ownerRefund, periodsProcessed: iterations };
}
