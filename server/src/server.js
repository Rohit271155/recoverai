import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './config/db.js';
import { Transaction } from './models/index.js';
import { seedDatabase } from './seed/seeder.js';

import dashboardRoutes from './routes/dashboardRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import recoveryRoutes from './routes/recoveryRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import policyRoutes from './routes/policyRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import receivableRoutes from './routes/receivableRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';

import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/api/health', async (req, res) => {
  const txnCount = await Transaction.countDocuments();
  res.json({
    status: 'healthy',
    product: 'RecoverAI — Autonomous Revenue Recovery Agent',
    tagline: 'Detect. Decide. Recover.',
    totalTransactionsInDb: txnCount,
    timestamp: new Date().toISOString(),
  });
});

// Seed API endpoint for easy resetting/re-seeding
app.post('/api/seed', async (req, res) => {
  try {
    const stats = await seedDatabase();
    res.json({ success: true, message: 'Database seeded successfully', stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/recovery', recoveryRoutes);
app.use('/api/recovery-actions', recoveryRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/receivables', receivableRoutes);
app.use('/api/checkout', checkoutRoutes);

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server & Initialize Database
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is freshly created / empty
    const txnCount = await Transaction.countDocuments();
    if (txnCount === 0) {
      console.log('[Server] Database is empty. Running initial auto-seeding...');
      await seedDatabase();
    } else {
      console.log(`[Server] Database contains ${txnCount} transactions.`);
    }

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`RecoverAI Backend Server running on port ${PORT}`);
      console.log(`Health Check: http://localhost:${PORT}/api/health`);
      console.log(`Dashboard API: http://localhost:${PORT}/api/dashboard`);
      console.log(`Transactions: http://localhost:${PORT}/api/transactions`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('[Server] Critical startup failure:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;
