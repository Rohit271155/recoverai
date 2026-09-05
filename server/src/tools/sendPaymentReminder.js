// Recovery Tool: Send Payment Reminder (Simulated)
export const sendPaymentReminderTool = {
  name: 'SEND_PAYMENT_REMINDER',
  description: 'Simulates dispatching polite multi-channel payment reminder.',

  async execute({ transaction, customer, simulationOutcome }) {
    const success = simulationOutcome?.success ?? true;
    const amount = transaction.amount;

    return {
      tool: 'SEND_PAYMENT_REMINDER',
      success,
      result: success ? 'PAYMENT_RECOVERED' : 'REMINDER_DISPATCHED_PENDING',
      amountRecovered: success ? amount : 0,
      message: success
        ? `Customer responded to reminder and cleared outstanding amount of ₹${amount.toLocaleString('en-IN')}.`
        : `Payment reminder dispatched via Email & WhatsApp to ${customer?.email || 'customer'}. Waiting for customer action.`,
      channel: 'SMS_WHATSAPP_EMAIL',
      notificationId: `NOTIF_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`,
      timestamp: new Date().toISOString(),
    };
  },
};

export default sendPaymentReminderTool;
