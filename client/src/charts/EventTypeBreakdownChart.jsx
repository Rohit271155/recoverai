import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const EVENT_LABELS = {
  PAYMENT_FAILURE: 'Payments',
  CHECKOUT_ABANDONMENT: 'Abandonment',
  SUBSCRIPTION_FAILURE: 'Subscriptions',
  OVERDUE_RECEIVABLE: 'Receivables',
};

const EVENT_COLORS = {
  PAYMENT_FAILURE: '#F43F5E',
  CHECKOUT_ABANDONMENT: '#06B6D4',
  SUBSCRIPTION_FAILURE: '#8B5CF6',
  OVERDUE_RECEIVABLE: '#F59E0B',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 bg-slate-900/95 border border-slate-700 rounded-lg shadow-xl text-xs backdrop-blur-md">
        <div className="font-semibold text-white mb-1">{data.eventType.replace(/_/g, ' ')}</div>
        <div className="text-slate-400">
          At Risk: <span className="font-mono font-bold text-rose-400">₹{data.atRiskAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="text-slate-400">
          Recovered: <span className="font-mono font-bold text-emerald-400">₹{data.recoveredAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="text-slate-400">
          Volume: <span className="font-mono font-bold text-white">{data.count} events</span>
        </div>
        <div className="text-slate-400 mt-1 border-t border-slate-800 pt-1">
          Recovery Rate: <span className="font-mono font-bold text-indigo-300">{data.recoveryRate}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export const EventTypeBreakdownChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        No event data available.
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    displayName: EVENT_LABELS[item.eventType] || item.eventType,
  }));

  const formatYAxis = (value) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value}`;
  };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis
            dataKey="displayName"
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxis}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="atRiskAmount" name="At Risk Revenue" radius={[6, 6, 0, 0]}>
            {chartData.map((entry) => (
              <Cell key={`cell-${entry.eventType}`} fill={EVENT_COLORS[entry.eventType] || '#6366F1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EventTypeBreakdownChart;
