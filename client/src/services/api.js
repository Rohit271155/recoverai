// API Service Client for RecoverAI
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = {
  async getDashboard() {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) {
      throw new Error(`Failed to load dashboard metrics: ${res.status} ${res.statusText}`);
    }
    const json = await res.json();
    return json.data;
  },

  async getTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/transactions${query ? `?${query}` : ''}`);
    if (!res.ok) {
      throw new Error(`Failed to load transactions: ${res.statusText}`);
    }
    return res.json();
  },

  async getTransactionById(id) {
    const res = await fetch(`${API_BASE}/transactions/${id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch transaction ${id}`);
    }
    return res.json();
  },

  async analyzeTransaction(id) {
    const res = await fetch(`${API_BASE}/transactions/${id}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to analyze transaction ${id}`);
    }
    return res.json();
  },

  async getCustomers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/customers${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to load customers');
    return res.json();
  },

  async getAuditLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/audit-logs${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to load audit logs');
    return res.json();
  },

  async getPolicies() {
    const res = await fetch(`${API_BASE}/policies`);
    if (!res.ok) throw new Error('Failed to load policies');
    return res.json();
  },

  async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error('Failed to load recovery analytics');
    return res.json();
  },

  async updatePolicy(policyData) {
    const res = await fetch(`${API_BASE}/policies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policyData),
    });
    if (!res.ok) throw new Error('Failed to update policy');
    return res.json();
  },

  async triggerSeed() {
    const res = await fetch(`${API_BASE}/seed`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to trigger database seeding');
    return res.json();
  },

  async recoverTransaction(id) {
    const res = await fetch(`${API_BASE}/transactions/${id}/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 409 || res.status === 403) {
        return json;
      }
      throw new Error(json.message || `Failed to execute recovery for transaction ${id}`);
    }
    return json;
  },

  async executeRecovery(id) {
    return this.recoverTransaction(id);
  },

  async addToQueue(id) {
    const res = await fetch(`${API_BASE}/transactions/${id}/queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 409) return json;
      throw new Error(json.message || `Failed to add transaction ${id} to queue`);
    }
    return json;
  },

  async runBatchRecovery(batchSize = 25) {
    const res = await fetch(`${API_BASE}/recovery/run-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchSize }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to execute batch recovery');
    }
    return res.json();
  },

  async getRecoveryQueue(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/recovery/queue${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to load recovery queue');
    return res.json();
  },

  async getSubscriptions() {
    const res = await fetch(`${API_BASE}/subscriptions`);
    if (!res.ok) throw new Error('Failed to load subscriptions');
    return res.json();
  },

  async getReceivables() {
    const res = await fetch(`${API_BASE}/receivables`);
    if (!res.ok) throw new Error('Failed to load receivables');
    return res.json();
  },

  async getCheckoutLoss() {
    const res = await fetch(`${API_BASE}/checkout`);
    if (!res.ok) throw new Error('Failed to load checkout loss events');
    return res.json();
  },

  async checkHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Backend health check failed');
    return res.json();
  },
};

export default api;
