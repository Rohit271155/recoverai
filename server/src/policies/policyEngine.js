// Deterministic Policy Engine for RecoverAI
// Enforces hard safety boundaries around all AI recommendations

export const validatePolicy = ({ transaction, customer, policy, aiRecommendation }) => {
  const currentPolicy = policy || {
    maxRetries: 3,
    retryIntervalHours: 6,
    maxContactAttempts: 3,
    maxDiscountPercent: 10,
    escalationThreshold: 50000,
  };

  const action = aiRecommendation?.recommendedAction || 'RETRY_PAYMENT';
  const retryCount = transaction?.retryCount || 0;
  const amount = transaction?.amount || 0;
  const contactAttempts = transaction?.metadata?.contactAttempts || 0;
  const lastRetryTimestamp = transaction?.metadata?.lastRetryAt ? new Date(transaction.metadata.lastRetryAt).getTime() : 0;

  const policyChecks = [];
  const violations = [];
  let effectiveAction = action;

  // Rule 1: Maximum Retries Limit
  if (retryCount >= currentPolicy.maxRetries) {
    violations.push(`Maximum retry limit of ${currentPolicy.maxRetries} has been reached (${retryCount}/${currentPolicy.maxRetries}).`);
    policyChecks.push({
      rule: 'MAX_RETRIES',
      label: 'Maximum Retries Limit',
      passed: false,
      message: `Exceeded: ${retryCount} retries performed (limit: ${currentPolicy.maxRetries})`,
    });
    effectiveAction = 'ESCALATE_TO_HUMAN';
  } else {
    policyChecks.push({
      rule: 'MAX_RETRIES',
      label: 'Maximum Retries Limit',
      passed: true,
      message: `Retry count (${retryCount}/${currentPolicy.maxRetries}) within allowed limit`,
    });
  }

  // Rule 2: Minimum Retry Interval (Cooldown)
  if (action === 'RETRY_PAYMENT' && lastRetryTimestamp > 0) {
    const elapsedHours = (Date.now() - lastRetryTimestamp) / (1000 * 3600);
    if (elapsedHours < currentPolicy.retryIntervalHours) {
      const waitRemaining = (currentPolicy.retryIntervalHours - elapsedHours).toFixed(1);
      violations.push(`Minimum retry cooldown interval not met. Please wait ${waitRemaining} more hours.`);
      policyChecks.push({
        rule: 'RETRY_INTERVAL',
        label: 'Retry Cooldown Interval',
        passed: false,
        message: `Cooldown active: ${waitRemaining}h remaining (min: ${currentPolicy.retryIntervalHours}h)`,
      });
      effectiveAction = 'SEND_PAYMENT_REMINDER';
    } else {
      policyChecks.push({
        rule: 'RETRY_INTERVAL',
        label: 'Retry Cooldown Interval',
        passed: true,
        message: 'Cooldown interval requirement satisfied',
      });
    }
  } else {
    policyChecks.push({
      rule: 'RETRY_INTERVAL',
      label: 'Retry Cooldown Interval',
      passed: true,
      message: 'Cooldown interval satisfied',
    });
  }

  // Rule 3: Maximum Contact Attempts
  const isContactAction = ['SEND_PAYMENT_REMINDER', 'GENERATE_PAYMENT_LINK', 'SEND_CHECKOUT_RECOVERY'].includes(action);
  if (isContactAction && contactAttempts >= currentPolicy.maxContactAttempts) {
    violations.push(`Customer contact attempt limit reached (${contactAttempts}/${currentPolicy.maxContactAttempts}). Further automated outreach blocked.`);
    policyChecks.push({
      rule: 'CONTACT_LIMIT',
      label: 'Customer Outreach Cap',
      passed: false,
      message: `Outreach cap reached (${contactAttempts}/${currentPolicy.maxContactAttempts})`,
    });
    effectiveAction = 'ESCALATE_TO_HUMAN';
  } else {
    policyChecks.push({
      rule: 'CONTACT_LIMIT',
      label: 'Customer Outreach Cap',
      passed: true,
      message: `Contact attempts (${contactAttempts}/${currentPolicy.maxContactAttempts}) within limit`,
    });
  }

  // Rule 4: High-Value Escalation Threshold
  if (amount >= currentPolicy.escalationThreshold) {
    policyChecks.push({
      rule: 'ESCALATION_THRESHOLD',
      label: 'High-Value Escalation Guard',
      passed: false,
      message: `Amount ₹${amount.toLocaleString('en-IN')} exceeds automated threshold ₹${currentPolicy.escalationThreshold.toLocaleString('en-IN')}`,
    });
    violations.push(`Transaction amount (₹${amount.toLocaleString('en-IN')}) exceeds auto-action threshold of ₹${currentPolicy.escalationThreshold.toLocaleString('en-IN')}. Mandatory human escalation required.`);
    effectiveAction = 'ESCALATE_TO_HUMAN';
  } else {
    policyChecks.push({
      rule: 'ESCALATION_THRESHOLD',
      label: 'High-Value Escalation Guard',
      passed: true,
      message: `Amount ₹${amount.toLocaleString('en-IN')} is within automated recovery threshold (< ₹${currentPolicy.escalationThreshold.toLocaleString('en-IN')})`,
    });
  }

  const allowed = violations.length === 0;
  let reason = '';

  if (allowed) {
    if (action === 'RETRY_PAYMENT') {
      reason = `Policy approved: retry count is ${retryCount}/${currentPolicy.maxRetries} and cooldown requirements are satisfied.`;
    } else if (isContactAction) {
      reason = `Policy approved: customer outreach attempts (${contactAttempts}/${currentPolicy.maxContactAttempts}) are within safe boundaries.`;
    } else {
      reason = `Policy approved: proposed intervention complies with all deterministic safety constraints.`;
    }
  } else {
    reason = `Policy blocked: ${violations.join(' ')} System redirected action to ${effectiveAction.replace(/_/g, ' ')}.`;
  }

  return {
    allowed,
    action,
    effectiveAction,
    reason,
    violations,
    policyChecks,
    timestamp: new Date().toISOString(),
  };
};

export default { validatePolicy };
