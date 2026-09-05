// Synthetic data generator for RecoverAI (550+ realistic fintech records in INR)

export const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Pari', 'Isha', 'Myra', 'Anika', 'Navya', 'Sneha',
  'Rohit', 'Vikram', 'Rajesh', 'Suresh', 'Amit', 'Neha', 'Pooja', 'Ritu', 'Karan', 'Deepak',
  'Sunil', 'Manish', 'Alok', 'Meera', 'Shreya', 'Kavita', 'Rohan', 'Tanvi', 'Varun', 'Nikhil'
];

export const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Gupta', 'Mehta', 'Singh', 'Chopra',
  'Deshmukh', 'Kulkarni', 'Bhat', 'Rao', 'Joshi', 'Menon', 'Pillai', 'Mukherjee', 'Banerjee', 'Das'
];

export const COMPANIES = [
  'TechCorp India', 'Nexus Solutions', 'RazorLogix', 'Bharat Commerce', 'Indus Cloud',
  'FinVeda Analytics', 'Zenith Logistics', 'AeroPay Digital', 'KisanDirect', 'UrbanPulse',
  'SwiftRetail', 'OmniSys Infotech', 'BluePeak Software', 'VedicHealth', 'NovaFin Technologies'
];

export const SEGMENTS = ['ENTERPRISE', 'MID_MARKET', 'SMB', 'RETAIL_VIP', 'RETAIL_STANDARD'];

export const PAYMENT_METHODS = [
  'UPI (PhonePe)', 'UPI (Google Pay)', 'UPI (Paytm)', 'UPI (BHIM)',
  'Credit Card (HDFC Bank)', 'Credit Card (ICICI Bank)', 'Credit Card (SBI Card)', 'Credit Card (Axis Bank)',
  'Debit Card (HDFC Bank)', 'Debit Card (State Bank of India)',
  'Netbanking (Kotak Mahindra)', 'Netbanking (HDFC Bank)', 'Netbanking (ICICI Bank)',
  'e-Mandate / NACH (Auto-Debit)'
];

export const FAILURE_REASONS = {
  PAYMENT_FAILURE: [
    'temporary bank decline',
    'insufficient_funds',
    'network_timeout',
    'authentication_failure',
    'expired_card',
    'bank_decline'
  ],
  CHECKOUT_ABANDONMENT: [
    'customer_abandoned',
    'payment_method_hesitation',
    'otp_timeout',
    'pricing_review_dropoff'
  ],
  SUBSCRIPTION_FAILURE: [
    'mandate_failure',
    'card_expired_on_file',
    'auto_debit_declined',
    'bank_mandate_limit_exceeded'
  ],
  OVERDUE_RECEIVABLE: [
    'invoice_overdue',
    'net30_delinquency',
    'pending_client_approval',
    'disputed_line_item'
  ]
};

// Deterministic Pseudo-Random Number Generator for repeatable seeds
class SeededRandom {
  constructor(seed = 123456789) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  range(min, max) {
    return Math.floor(min + this.next() * (max - min));
  }
  choice(array) {
    return array[Math.floor(this.next() * array.length)];
  }
}

export const generateSeedData = () => {
  const rng = new SeededRandom(42);

  // 1. Generate 100 realistic Customers
  const customers = [];
  
  // Deterministic Demo Customer
  customers.push({
    customerId: 'CUST_DEMO_PRIYA',
    name: 'Priya Sharma',
    email: 'priya.sharma@cloudtech.in',
    phone: '+91 98201 45678',
    totalPayments: 11,
    successfulPayments: 11,
    failedPayments: 1,
    lifetimeValue: 208989,
    previousSuccessfulPayments: 11,
    customerSegment: 'ENTERPRISE',
    metadata: {
      company: 'CloudTech Solutions Pvt Ltd',
      tier: 'Enterprise Platinum',
      registeredDate: '2023-01-15'
    }
  });

  for (let i = 1; i <= 100; i++) {
    const custId = `CUST_${String(i).padStart(4, '0')}`;
    const fName = rng.choice(FIRST_NAMES);
    const lName = rng.choice(LAST_NAMES);
    const company = rng.choice(COMPANIES);
    const segment = rng.choice(SEGMENTS);
    const totalPayments = rng.range(3, 40);
    const failedPayments = rng.range(0, 4);
    const successfulPayments = totalPayments - failedPayments;
    const avgAmount = segment === 'ENTERPRISE' ? rng.range(25000, 80000) :
                      segment === 'MID_MARKET' ? rng.range(10000, 35000) :
                      segment === 'RETAIL_VIP' ? rng.range(5000, 20000) : rng.range(800, 8000);
    const lifetimeValue = successfulPayments * avgAmount;

    customers.push({
      customerId: custId,
      name: `${fName} ${lName}`,
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}@${company.toLowerCase().replace(/[^a-z]/g, '')}.in`,
      phone: `+91 9${rng.range(100000000, 999999999)}`,
      totalPayments,
      successfulPayments,
      failedPayments,
      lifetimeValue,
      previousSuccessfulPayments: successfulPayments,
      customerSegment: segment,
      metadata: {
        company,
        accountAgeMonths: rng.range(4, 36)
      }
    });
  }

  // 2. Generate 550+ Transactions across the 4 Event Types
  const transactions = [];
  const recoveryActions = [];
  const auditLogs = [];

  // Flagship Demo Transaction (TXN_DEMO_001)
  const demoTxn = {
    transactionId: 'TXN_DEMO_001',
    customerId: 'CUST_DEMO_PRIYA',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@cloudtech.in',
    eventType: 'PAYMENT_FAILURE',
    amount: 18999,
    currency: 'INR',
    status: 'FAILED',
    failureReason: 'temporary bank decline',
    paymentMethod: 'Credit Card (HDFC Bank)',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000), // 2 hours ago
    retryCount: 0,
    recoveryStatus: 'NOT_STARTED',
    recoveryProbability: 87,
    recommendedAction: 'RETRY_PAYMENT',
    amountRecovered: 0,
    metadata: {
      planName: 'Enterprise Cloud Suite (Annual Renewal)',
      bankDeclineCode: 'TRANS_TIMEOUT_ISSUER_91',
      invoiceNumber: 'INV-2026-0899',
      highPriority: true,
      notes: 'Strong repeat customer with 11 prior successful payments. Decline was transient network timeout with issuer switch.'
    }
  };
  transactions.push(demoTxn);

  auditLogs.push({
    transactionId: 'TXN_DEMO_001',
    event: 'PAYMENT_FAILED',
    actor: 'SYSTEM',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000),
    metadata: {
      amount: 18999,
      reason: 'temporary bank decline',
      bankCode: 'TRANS_TIMEOUT_ISSUER_91'
    }
  });

  // Generate target distribution:
  // PAYMENT_FAILURE: 220
  // CHECKOUT_ABANDONMENT: 130
  // SUBSCRIPTION_FAILURE: 110
  // OVERDUE_RECEIVABLE: 90
  // Total: 551 transactions

  const eventConfigs = [
    { type: 'PAYMENT_FAILURE', count: 220, defaultActions: ['RETRY_PAYMENT', 'SEND_PAYMENT_REMINDER', 'GENERATE_PAYMENT_LINK'] },
    { type: 'CHECKOUT_ABANDONMENT', count: 130, defaultActions: ['SEND_CHECKOUT_RECOVERY', 'GENERATE_PAYMENT_LINK'] },
    { type: 'SUBSCRIPTION_FAILURE', count: 110, defaultActions: ['RETRY_PAYMENT', 'GENERATE_PAYMENT_LINK', 'SEND_PAYMENT_REMINDER'] },
    { type: 'OVERDUE_RECEIVABLE', count: 90, defaultActions: ['SEND_PAYMENT_REMINDER', 'GENERATE_PAYMENT_LINK', 'ESCALATE_TO_HUMAN'] }
  ];

  let txnIndex = 2; // Demo is TXN_DEMO_001
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 3600 * 1000;

  for (const config of eventConfigs) {
    for (let i = 0; i < config.count; i++) {
      const txnId = `TXN_${String(txnIndex).padStart(6, '0')}`;
      txnIndex++;

      const cust = rng.choice(customers);
      const failureReason = rng.choice(FAILURE_REASONS[config.type]);
      const paymentMethod = rng.choice(PAYMENT_METHODS);

      // Realistic INR amounts based on event type & segment
      let amount = 0;
      if (config.type === 'PAYMENT_FAILURE') {
        amount = cust.customerSegment === 'ENTERPRISE' ? rng.range(15000, 65000) :
                 cust.customerSegment === 'MID_MARKET' ? rng.range(6000, 25000) : rng.range(1200, 12000);
      } else if (config.type === 'CHECKOUT_ABANDONMENT') {
        amount = rng.range(899, 18500);
      } else if (config.type === 'SUBSCRIPTION_FAILURE') {
        amount = cust.customerSegment === 'ENTERPRISE' ? rng.range(20000, 85000) : rng.range(999, 19999);
      } else if (config.type === 'OVERDUE_RECEIVABLE') {
        amount = rng.range(18000, 145000);
      }

      // Timestamp spread across the past 30 days
      const txnTime = new Date(now - rng.range(1000 * 60 * 10, thirtyDaysMs));

      // Recovery probability calculation (30% to 94%)
      let probability = rng.range(35, 95);
      if (cust.customerSegment === 'ENTERPRISE' || cust.successfulPayments > 8) {
        probability = Math.min(96, probability + 12);
      }
      if (failureReason === 'insufficient_funds' || failureReason === 'customer_abandoned') {
        probability = Math.max(25, probability - 15);
      }

      const recommendedAction = rng.choice(config.defaultActions);
      const retryCount = rng.range(0, 4);

      // Determine outcome / recovery status:
      // ~38% recovered historically, ~20% in progress, ~12% failed/escalated/stopped, ~30% not started (active in queue)
      const outcomeRoll = rng.next();
      let recoveryStatus = 'NOT_STARTED';
      let status = 'FAILED';
      let amountRecovered = 0;

      if (config.type === 'CHECKOUT_ABANDONMENT') status = 'ABANDONED';
      if (config.type === 'OVERDUE_RECEIVABLE') status = 'OVERDUE';

      if (outcomeRoll < 0.38) {
        // Recovered!
        recoveryStatus = 'RECOVERED';
        status = 'RECOVERED';
        amountRecovered = amount;

        // Record simulated successful recovery action & audit log
        const actionTime = new Date(txnTime.getTime() + rng.range(3600 * 1000, 24 * 3600 * 1000));
        recoveryActions.push({
          transactionId: txnId,
          action: recommendedAction,
          reason: `Automated recovery executed for ${failureReason}`,
          probability,
          status: 'SUCCESS',
          executedAt: actionTime,
          result: { success: true, message: 'Payment collected successfully', gatewayRef: `PAY_REF_${rng.range(100000, 999999)}` },
          amountRecovered: amount,
          failureReason
        });

        auditLogs.push({
          transactionId: txnId,
          event: 'RECOVERY_SUCCEEDED',
          actor: 'RECOVERY_EXECUTOR',
          timestamp: actionTime,
          metadata: { amountRecovered: amount, action: recommendedAction }
        });
      } else if (outcomeRoll < 0.58) {
        // Active queue: Not started
        recoveryStatus = 'NOT_STARTED';
      } else if (outcomeRoll < 0.78) {
        // Analyzed / In progress
        recoveryStatus = rng.choice(['ANALYZED', 'IN_PROGRESS']);
      } else if (outcomeRoll < 0.90) {
        // Escalated
        recoveryStatus = 'ESCALATED';
        status = 'ESCALATED';
      } else {
        // Stopped or Failed
        recoveryStatus = rng.choice(['FAILED', 'STOPPED']);
        status = 'STOPPED';
      }

      const transactionDoc = {
        transactionId: txnId,
        customerId: cust.customerId,
        customerName: cust.name,
        customerEmail: cust.email,
        eventType: config.type,
        amount,
        currency: 'INR',
        status,
        failureReason,
        paymentMethod,
        timestamp: txnTime,
        retryCount,
        recoveryStatus,
        recoveryProbability: probability,
        recommendedAction,
        amountRecovered,
        metadata: {
          customerSegment: cust.customerSegment,
          lifetimeValue: cust.lifetimeValue,
          daysPastDue: config.type === 'OVERDUE_RECEIVABLE' ? rng.range(5, 45) : undefined,
          cartItemCount: config.type === 'CHECKOUT_ABANDONMENT' ? rng.range(1, 6) : undefined
        }
      };

      transactions.push(transactionDoc);
    }
  }

  // 3. Default Policy Document
  const defaultPolicy = {
    policyId: 'default_policy',
    maxRetries: 3,
    retryIntervalHours: 6,
    maxContactAttempts: 3,
    maxDiscountPercent: 10,
    escalationThreshold: 50000,
    isActive: true
  };

  return { customers, transactions, recoveryActions, auditLogs, defaultPolicy };
};
