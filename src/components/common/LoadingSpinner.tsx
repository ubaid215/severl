import { LucideProps } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-solid border-yellow-500 border-t-transparent ${sizeClasses[size]}`}
        role="status"
        aria-label="loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

// Optional: Spinner with logo/icon in the center
interface LoadingSpinnerWithIconProps extends LoadingSpinnerProps {
  icon?: React.ComponentType<LucideProps>;
  iconProps?: LucideProps;
}

export function LoadingSpinnerWithIcon({ 
  size = 'md', 
  className = '', 
  icon: Icon,
  iconProps = {} 
}: LoadingSpinnerWithIconProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-18 w-18'
  };

  const iconSize = {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-solid border-yellow-500 border-t-transparent ${sizeClasses[size]}`}
        role="status"
        aria-label="loading"
      />
      {Icon && (
        <div className="absolute">
          <Icon 
            size={iconSize[size]} 
            className="text-yellow-500" 
            {...iconProps} 
          />
        </div>
      )}
    </div>
  );
}