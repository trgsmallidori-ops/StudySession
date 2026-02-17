'use client';

import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const base = 'rounded-lg font-semibold transition-all disabled:opacity-50';
    const variants = {
      primary: 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 shadow-neon-cyan',
      secondary: 'bg-white/5 border border-white/10 hover:border-white/20',
      ghost: 'hover:bg-white/5',
      danger: 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30',
    };
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    };
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
export default Button;
