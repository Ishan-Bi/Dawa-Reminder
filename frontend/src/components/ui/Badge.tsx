import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'taken' | 'pending' | 'missed' | 'skipped' | 'foodBefore' | 'foodAfter' | 'neutral' | 'primary';
  className?: string;
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  const variantStyles = {
    taken: 'bg-[#E6F9F0] text-[#0E6245] border-[#167C53]/20',
    pending: 'bg-[#FFF9EB] text-[#B45309] border-[#B45309]/20',
    missed: 'bg-[#FDE8E7] text-[#B91C1C] border-[#B91C1C]/20',
    skipped: 'bg-gray-100 text-gray-600 border-gray-200',
    foodBefore: 'bg-[#FFF4D6] text-[#B45309] border-amber-300',
    foodAfter: 'bg-[#E6F9F0] text-[#0E6245] border-emerald-300',
    neutral: 'bg-gray-50 text-gray-600 border-gray-200',
    primary: 'bg-[#E9F5EF] text-[#167C53] border-[#167C53]/30',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
