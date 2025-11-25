import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: string;
  color?: 'primary' | 'info' | 'warning' | 'error';
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend, trendUp, icon, color = 'primary' }) => {
  const colorMap = {
    primary: 'text-brand-primary',
    info: 'text-semantic-info',
    warning: 'text-semantic-warning',
    error: 'text-semantic-error',
  };

  return (
    <div className="bg-surface-1 border border-surface-border rounded-xl p-5 hover:bg-surface-2 transition-colors duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg bg-surface-3 ${colorMap[color]}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-medium ${trendUp ? 'text-semantic-success' : 'text-semantic-error'}`}>
            <span className="material-symbols-outlined text-sm mr-0.5">
              {trendUp ? 'trending_up' : 'trending_down'}
            </span>
            {trend}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-txt-tertiary text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-txt-primary">{value}</p>
      </div>
    </div>
  );
};