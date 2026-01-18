import React from 'react';
import { cn } from "@/lib/utils";

export default function CrowdIndicator({ level, showLabel = true, size = "md" }) {
  const config = {
    low: {
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      label: 'Low Crowd',
      percentage: 25
    },
    moderate: {
      color: 'bg-amber-500',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      label: 'Moderate',
      percentage: 50
    },
    high: {
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-700',
      label: 'High Crowd',
      percentage: 75
    },
    critical: {
      color: 'bg-red-500',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      label: 'Critical',
      percentage: 95
    }
  };

  const current = config[level] || config.low;
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className="flex flex-col gap-1">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className={cn("text-xs font-medium", current.textColor)}>
            {current.label}
          </span>
          <span className="text-xs text-gray-500">{current.percentage}%</span>
        </div>
      )}
      <div className={cn("w-full rounded-full overflow-hidden", current.bgColor, sizeClasses[size])}>
        <div 
          className={cn("h-full rounded-full transition-all duration-500", current.color)}
          style={{ width: `${current.percentage}%` }}
        />
      </div>
    </div>
  );
}