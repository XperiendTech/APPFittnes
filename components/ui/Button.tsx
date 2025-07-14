import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseClasses = 'rounded-lg font-semibold shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark';
  
  const sizeClasses = size === 'sm'
    ? 'px-2 py-1 text-xs'
    : 'px-6 py-2';

  const variantClasses = variant === 'primary' 
    ? 'bg-brand-primary hover:bg-brand-secondary text-white focus:ring-brand-primary'
    : 'bg-gray-600 hover:bg-gray-500 text-white focus:ring-gray-500';

  return (
    <button className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
