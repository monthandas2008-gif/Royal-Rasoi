import React from 'react';
import { cn } from './Button';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ hoverEffect = true, className, children, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white/80 backdrop-blur-sm border border-[#E7E5E4] rounded-xl p-6 shadow-sm transition-all duration-300',
        hoverEffect && 'hover:shadow-md hover:border-[#D4AF37]/50 hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
