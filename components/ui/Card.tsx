'use client';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'pink' | 'purple';
}

export default function Card({ children, className = '', glow }: CardProps) {
  const glowBorder = glow
    ? `border-${glow === 'cyan' ? 'accent-cyan' : glow === 'pink' ? 'accent-pink' : 'accent-purple'}/20`
    : 'border-white/5';
  return (
    <div
      className={`glass rounded-xl p-6 border ${glowBorder} ${className}`}
    >
      {children}
    </div>
  );
}
