import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  className?: string;
  onClick?: () => void;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  className = '',
  onClick,
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors';
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const variantClasses = {
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
    primary: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    warning: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    outline: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-transparent',
  };

  const interactiveClass = onClick ? 'cursor-pointer hover:opacity-80' : '';

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${interactiveClass} ${className}`;

  return (
    <span className={classes} onClick={onClick}>
      {Icon && iconPosition === 'left' && (
        <Icon className={`mr-1.5 ${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`} />
      )}
      {children}
      {Icon && iconPosition === 'right' && (
        <Icon className={`ml-1.5 ${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`} />
      )}
    </span>
  );
}