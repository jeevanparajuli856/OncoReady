import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../lib/cn';

const iconStroke = { strokeWidth: 2.5 } as const;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'mint' | 'sun';
  showArrow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  showArrow = false,
  className,
  children,
  ...props
}) => {
  const variants = {
    primary: 'btn-candy',
    secondary: 'btn-ghost',
    mint: 'btn-candy !bg-mint !text-ink',
    sun: 'btn-candy !bg-sun !text-ink',
  };

  return (
    <button className={cn(variants[variant], className)} {...props}>
      <span>{children}</span>
      {showArrow && (
        <span className="icon-bubble w-7 h-7 bg-white text-ink">
          <ArrowRight className="w-3.5 h-3.5" {...iconStroke} />
        </span>
      )}
    </button>
  );
};

export const StickerCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  featured?: boolean;
  hover?: boolean;
}> = ({ children, className, featured = false, hover = true }) => (
  <div
    className={cn(
      featured ? 'card-sticker-featured' : 'card-sticker',
      hover && 'transition-transform duration-300 ease-bouncey hover:-rotate-1 hover:scale-[1.02]',
      className
    )}
  >
    {children}
  </div>
);

export const IconBubble: React.FC<{
  children: React.ReactNode;
  color?: 'accent' | 'pop' | 'sun' | 'mint' | 'white';
  className?: string;
}> = ({ children, color = 'accent', className }) => {
  const colors = {
    accent: 'bg-accent text-white',
    pop: 'bg-pop text-white',
    sun: 'bg-sun text-ink',
    mint: 'bg-mint text-ink',
    white: 'bg-white text-ink',
  };

  return (
    <span className={cn('icon-bubble w-11 h-11', colors[color], className)}>
      {children}
    </span>
  );
};

export const StatusPill: React.FC<{
  tone?: 'ready' | 'risk' | 'review' | 'idle';
  children: React.ReactNode;
}> = ({ tone = 'idle', children }) => {
  const tones = {
    ready: 'bg-mint/25 text-ink border-ink',
    risk: 'bg-sun/40 text-ink border-ink',
    review: 'bg-accent/15 text-ink border-ink',
    idle: 'bg-white text-ink border-ink',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-bold border-2', tones[tone])}>
      {children}
    </span>
  );
};
