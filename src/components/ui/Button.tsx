import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      icon: Icon,
      iconPosition = 'left',
      isLoading = false,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const sizeClasses = {
      sm: 'text-sm px-3 py-1.5',
      md: 'text-base px-4 py-2',
      lg: 'text-lg px-6 py-3',
    };

    const variantClasses = {
      primary: 'bg-yellow-500 hover:bg-yellow-600 text-black focus:ring-yellow-500',
      secondary: 'bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white focus:ring-gray-500',
      outline: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:ring-gray-500',
      ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 focus:ring-gray-500',
      danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const interactiveClass = !disabled && !isLoading ? 'hover:shadow-md' : '';

    const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${interactiveClass} ${className}`;

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            {children}
          </>
        ) : (
          <>
            {Icon && iconPosition === 'left' && (
              <Icon className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} mr-2`} />
            )}
            {children}
            {Icon && iconPosition === 'right' && (
              <Icon className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} ml-2`} />
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;