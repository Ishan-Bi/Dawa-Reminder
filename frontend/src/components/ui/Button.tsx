import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl font-semibold',
  };

  const variantStyles = {
    primary: 'bg-[#167C53] text-white hover:bg-[#0D4E34] shadow-sm',
    secondary: 'bg-[#E9F5EF] text-[#167C53] hover:bg-[#d8ece2]',
    outline: 'border border-gray-200 text-gray-700 bg-white hover:bg-gray-50',
    danger: 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200',
    ghost: 'text-gray-600 hover:bg-gray-100',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
