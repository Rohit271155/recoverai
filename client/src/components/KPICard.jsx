import React from 'react';
import AnimatedCounter from './AnimatedCounter';

export const KPICard = ({
  title,
  value,
  prefix = '',
  suffix = '',
  isCurrency = false,
  subtitle,
  icon: Icon,
  trend,
  variant = 'neutral',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'recovered':
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
          badge: 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40',
        };
      case 'risk':
        return {
          iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
          badge: 'text-rose-400 bg-rose-950/40 border border-rose-800/40',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
          badge: 'text-amber-400 bg-amber-950/40 border border-amber-800/40',
        };
      default:
        return {
          iconBg: 'bg-[#1A2232] text-slate-300 border border-[#242F45]',
          badge: 'text-slate-400 bg-[#0D111A] border border-[#1E2638]',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="p-5 rounded-xl bg-[#131822] border border-[#1E2638] hover:border-[#2D3952] transition-colors shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg ${styles.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl lg:text-3xl font-bold tracking-tight text-white font-mono">
          <AnimatedCounter
            value={value}
            prefix={prefix}
            suffix={suffix}
            isCurrency={isCurrency}
          />
        </span>
      </div>

      {subtitle && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {trend && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${styles.badge}`}>
              {trend}
            </span>
          )}
          <span className="truncate">{subtitle}</span>
        </div>
      )}
    </div>
  );
};

export default KPICard;
