import React from 'react';
import { cn } from './Button';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'available' | 'booked' | 'waiting' | 'reserved' | 'veg' | 'non-veg' | 'gold';
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'available', className, children, ...props }) => {
  const variants = {
    available: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    booked: 'bg-rose-50 text-rose-800 border-rose-300',
    waiting: 'bg-amber-50 text-amber-800 border-amber-300',
    reserved: 'bg-purple-50 text-purple-800 border-purple-300',
    veg: 'bg-green-50 text-green-700 border-green-400',
    'non-veg': 'bg-red-50 text-red-700 border-red-400',
    gold: 'bg-[#FAEEC5] text-[#855D10] border-[#D4AF37]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-xs transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
