import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '', 
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto',
    xl: 'h-24 w-auto'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="https://cdn.builder.io/api/v1/image/assets%2F0fefd836b28e486ab490d6475d657a91%2F114d8d8359e74f84993f1764692d10bb?format=webp&width=800"
        alt="Fast Command Logo"
        className={sizeClasses[size]}
      />
      {showText && (
        <div className={`mr-3 ${textSizeClasses[size]}`}>
          <h1 className="font-bold text-investment-primary-800">
            نظام إدارة الاستثمار
          </h1>
          <p className="text-sm text-investment-primary-600">
            Fast Command
          </p>
        </div>
      )}
    </div>
  );
};
