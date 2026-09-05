import { retryPaymentTool } from './retryPayment.js';
import { sendPaymentReminderTool } from './sendPaymentReminder.js';
import { generatePaymentLinkTool } from './generatePaymentLink.js';
import { sendCheckoutRecoveryTool } from './sendCheckoutRecovery.js';
import { escalateToHumanTool } from './escalateToHuman.js';
import { stopRecoveryTool } from './stopRecovery.js';

export const RECOVERY_TOOLS = {
  RETRY_PAYMENT: retryPaymentTool,
  SEND_PAYMENT_REMINDER: sendPaymentReminderTool,
  GENERATE_PAYMENT_LINK: generatePaymentLinkTool,
  SEND_CHECKOUT_RECOVERY: sendCheckoutRecoveryTool,
  ESCALATE_TO_HUMAN: escalateToHumanTool,
  STOP_RECOVERY: stopRecoveryTool,
};

export const getToolForAction = (action) => {
  return RECOVERY_TOOLS[action] || null;
};

export default RECOVERY_TOOLS;
