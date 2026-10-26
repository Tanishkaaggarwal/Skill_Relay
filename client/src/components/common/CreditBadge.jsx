import React from 'react';
import { Coins } from 'lucide-react';

export const CreditBadge = ({ amount, size = 'md', variant = 'amber' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-base px-3.5 py-1.5 gap-2 font-bold',
  };

  const variantClasses = {
    amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      <Coins className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} text-amber-500`} />
      <span>{amount} Credits</span>
    </span>
  );
};
