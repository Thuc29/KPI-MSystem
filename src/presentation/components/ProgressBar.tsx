import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  showTrend?: boolean;
  previousValue?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  label,
  showPercentage = true,
  showTrend = false,
  previousValue,
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const cappedPercentage = Math.min(percentage, 100);

  const getColor = () => {
    if (cappedPercentage >= 80) return 'bg-green-500';
    if (cappedPercentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTrend = () => {
    if (!previousValue) return null;
    const prevPercentage = total > 0 ? (previousValue / total) * 100 : 0;
    const diff = percentage - prevPercentage;
    
    if (diff > 0) return <TrendingUp className="text-green-500" size={16} />;
    if (diff < 0) return <TrendingDown className="text-red-500" size={16} />;
    return <Minus className="text-gray-400" size={16} />;
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <div className="flex items-center gap-2">
            {showPercentage && (
              <span className="text-sm font-semibold text-gray-900">{cappedPercentage}%</span>
            )}
            {showTrend && getTrend()}
          </div>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${cappedPercentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{current} / {total}</span>
      </div>
    </div>
  );
};
