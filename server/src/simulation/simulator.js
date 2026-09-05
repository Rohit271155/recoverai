// Deterministic Recovery Outcome Simulator for RecoverAI

/**
 * Generates a stable numeric hash from a string
 */
const stringHash = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const simulateOutcome = ({ transaction, customer, action, probability }) => {
  // Flagship Demo Transaction Guaranteed Deterministic Success
  if (transaction.transactionId === 'TXN_DEMO_001') {
    return {
      success: true,
      amountRecovered: 18999,
      result: 'PAYMENT_RECOVERED',
      message: 'Payment of ₹18,999 successfully recovered via automated payment retry.',
      timestamp: new Date().toISOString(),
    };
  }

  // Non-charging terminal actions
  if (action === 'ESCALATE_TO_HUMAN') {
    return {
      success: true,
      amountRecovered: 0,
      result: 'ESCALATED',
      message: 'Case successfully escalated to human finance operations queue.',
      timestamp: new Date().toISOString(),
    };
  }

  if (action === 'STOP_RECOVERY') {
    return {
      success: true,
      amountRecovered: 0,
      result: 'STOPPED',
      message: 'Automated recovery workflow terminated per policy limits.',
      timestamp: new Date().toISOString(),
    };
  }

  // Deterministic Roll based on transactionId + retryCount + customerId
  const hashSeed = stringHash(`${transaction.transactionId}_${transaction.retryCount || 0}_${customer?.customerId || ''}`);
  const roll = hashSeed % 100;
  const effectiveProb = probability ?? transaction.recoveryProbability ?? 65;

  const success = roll < effectiveProb;
  const amount = transaction.amount || 0;

  if (success) {
    return {
      success: true,
      amountRecovered: amount,
      result: 'PAYMENT_RECOVERED',
      message: `Successfully recovered ₹${amount.toLocaleString('en-IN')} via ${action.replace(/_/g, ' ')}.`,
      timestamp: new Date().toISOString(),
    };
  } else {
    return {
      success: false,
      amountRecovered: 0,
      result: 'RECOVERY_FAILED',
      message: `Recovery attempt unsuccessful: issuer rejected or customer did not respond to ${action.replace(/_/g, ' ')}.`,
      timestamp: new Date().toISOString(),
    };
  }
};

export default { simulateOutcome };
