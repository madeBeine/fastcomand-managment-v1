import React from 'react';
import { cn } from '@/lib/utils';

interface NumberProps {
  value: number | string;
  className?: string;
  currency?: boolean;
  percentage?: boolean;
  decimal?: number;
}

export const Number: React.FC<NumberProps> = ({ 
  value, 
  className, 
  currency = false, 
  percentage = false,
  decimal = 0 
}) => {
  const formatNumber = (num: number | string) => {
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    
    if (isNaN(numValue)) return '0';
    
    let formatted = numValue.toLocaleString('en-US', {
      minimumFractionDigits: decimal,
      maximumFractionDigits: decimal,
    });
    
    if (currency) {
      formatted += ' MRU';
    }
    
    if (percentage) {
      formatted += '%';
    }
    
    return formatted;
  };

  return (
    <span className={cn('number ltr font-mono', className)}>
      {formatNumber(value)}
    </span>
  );
};
