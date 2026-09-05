import dotenv from 'dotenv';
dotenv.config();

import { connectDB, disconnectDB } from '../config/db.js';
import { Transaction, Customer, RecoveryAction, AuditLog, Policy } from '../models/index.js';
import { generateSeedData } from './seedData.js';

export const seedDatabase = async () => {
  try {
    console.log('[Seeder] Starting RecoverAI database seeding...');
    await connectDB();

    // Clear existing collections
    await Promise.all([
      Transaction.deleteMany({}),
      Customer.deleteMany({}),
      RecoveryAction.deleteMany({}),
      AuditLog.deleteMany({}),
      Policy.deleteMany({})
    ]);
    console.log('[Seeder] Cleared previous records.');

    // Generate fresh seed data
    const { customers, transactions, recoveryActions, auditLogs, defaultPolicy } = generateSeedData();

    // Insert records
    await Policy.create(defaultPolicy);
    await Customer.insertMany(customers);
    await Transaction.insertMany(transactions);
    await RecoveryAction.insertMany(recoveryActions);
    await AuditLog.insertMany(auditLogs);

    // Compute stats
    const totalTransactions = await Transaction.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const demoRecord = await Transaction.findOne({ transactionId: 'TXN_DEMO_001' });

    const eventStats = await Transaction.aggregate([
      { $group: { _id: '$eventType', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
    ]);

    console.log('====================================================');
    console.log('RECOVERAI SEED SUMMARY');
    console.log('====================================================');
    console.log(`Total Customers Seeded:    ${totalCustomers}`);
    console.log(`Total Transactions Seeded: ${totalTransactions}`);
    console.log('----------------------------------------------------');
    eventStats.forEach(stat => {
      console.log(`- ${stat._id.padEnd(24)}: ${String(stat.count).padStart(4)} records | ₹${stat.totalAmount.toLocaleString('en-IN')}`);
    });
    console.log('----------------------------------------------------');
    console.log(`Flagship Demo Transaction: TXN_DEMO_001`);
    console.log(`Customer:                  ${demoRecord?.customerName} (${demoRecord?.customerEmail})`);
    console.log(`Amount:                    ₹${demoRecord?.amount?.toLocaleString('en-IN')}`);
    console.log(`Event:                     ${demoRecord?.eventType}`);
    console.log(`Failure Reason:            ${demoRecord?.failureReason}`);
    console.log(`Recovery Probability:      ${demoRecord?.recoveryProbability}%`);
    console.log(`Recommended Action:        ${demoRecord?.recommendedAction}`);
    console.log('====================================================');
    console.log('[Seeder] Database seeding completed successfully.');

    return { totalTransactions, totalCustomers, demoRecord };
  } catch (error) {
    console.error('[Seeder] Seeding failed with error:', error);
    throw error;
  }
};

// If run directly from CLI
if (process.argv[1]?.endsWith('seeder.js')) {
  seedDatabase()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async () => {
      await disconnectDB();
      process.exit(1);
    });
}
