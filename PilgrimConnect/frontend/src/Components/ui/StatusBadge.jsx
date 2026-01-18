import React from 'react';
import { cn } from "@/lib/utils";

export default function StatusBadge({ status, variant = "default" }) {
  const statusConfig = {
    // Booking statuses
    confirmed: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Confirmed' },
    checked_in: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Checked In' },
    completed: { color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Completed' },
    cancelled: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Cancelled' },
    no_show: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'No Show' },
    
    // Emergency statuses
    reported: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Reported' },
    acknowledged: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Acknowledged' },
    dispatched: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Dispatched' },
    in_progress: { color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'In Progress' },
    resolved: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Resolved' },
    
    // Resource statuses
    available: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Available' },
    busy: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Busy' },
    offline: { color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Offline' },
    en_route: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'En Route' },
    
    // Personnel statuses
    on_duty: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'On Duty' },
    off_duty: { color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Off Duty' },
    on_break: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'On Break' },
    responding: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Responding' },

    // Crowd levels
    low: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Low' },
    moderate: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Moderate' },
    high: { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'High' },
    critical: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Critical' },
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-700 border-gray-200', label: status };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      config.color
    )}>
      {config.label}
    </span>
  );
}