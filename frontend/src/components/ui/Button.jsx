import { cn } from '../../lib/utils';

export function Button({ 
  variant = 'primary', 
  size = 'md',
  children,
  icon,
  disabled,
  onClick,
  type = 'button',
  className
}) {
  const baseClasses = "font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
      {icon}
    </button>
  );
}
