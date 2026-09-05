// Recovery Tool: Retry Payment (Simulated)
export const retryPaymentTool = {
  name: 'RETRY_PAYMENT',
  description: 'Simulates re-attempting payment collection via banking gateway switch.',

  async execute({ transaction, customer, simulationOutcome }) {
    const success = simulationOutcome?.success ?? true;
    const amount = transaction.amount;

    return {
      tool: 'RETRY_PAYMENT',
      success,
      result: success ? 'PAYMENT_RECOVERED' : 'RETRY_DECLINED',
      amountRecovered: success ? amount : 0,
      message: success
        ? `Payment of ₹${amount.toLocaleString('en-IN')} successfully collected via automated retry.`
        : `Payment retry was declined by cardholder issuer switch.`,
      channel: 'GATEWAY_AUTO_RETRY',
      gatewayRef: `PG_RETRY_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`,
      timestamp: new Date().toISOString(),
    };
  },
};

export default retryPaymentTool;
