
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className,
  ...props
}) => {
  const baseStyles = "font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 flex items-center justify-center transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-400",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400",
    ghost: "bg-transparent text-emerald-600 hover:bg-emerald-100 focus:ring-emerald-500",
    outline: "bg-transparent text-emerald-600 border border-emerald-500 hover:bg-emerald-50 focus:ring-emerald-400",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}
      {...props}
    >
      {leftIcon && <span className={children ? "mr-2" : ""}>{leftIcon}</span>}
      {children}
      {rightIcon && <span className={children ? "ml-2" : ""}>{rightIcon}</span>}
    </button>
  );
};

export default Button;