import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../lib/cn';

const iconStroke = { strokeWidth: 2 } as const;

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
    mint: 'btn-candy !bg-mint',
    sun: 'btn-candy !bg-pop',
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
      hover && 'transition-transform duration-300 hover:-translate-y-0.5',
      className
    )}
  >
    {children}
  </div>
);

export const FeatureMark: React.FC<{
  children: React.ReactNode;
  tone?: 'accent' | 'pop' | 'sun' | 'mint';
  className?: string;
}> = ({ children, tone = 'accent', className }) => {
  const wells = {
    accent: 'bg-accent/12',
    pop: 'bg-pop/12',
    sun: 'bg-sun/20',
    mint: 'bg-mint/12',
  };

  return (
    <span className={cn('inline-flex w-14 h-14 rounded-2xl border-2 border-ink items-center justify-center bg-[#FFFDF8]', wells[tone], className)}>
      <span className="inline-flex w-9 h-9 rounded-full border-2 border-ink bg-white items-center justify-center text-ink text-lg">
        {children}
      </span>
    </span>
  );
};

export const IconBubble: React.FC<{
  children: React.ReactNode;
  color?: 'accent' | 'pop' | 'sun' | 'mint' | 'white';
  className?: string;
}> = ({ children, color = 'accent', className }) => {
  const colors = {
    accent: 'bg-accent/15 text-ink',
    pop: 'bg-pop/15 text-ink',
    sun: 'bg-sun/20 text-ink',
    mint: 'bg-mint/15 text-ink',
    white: 'bg-white text-ink shadow-glass',
  };

  return (
    <span className={cn('icon-bubble w-12 h-12', colors[color], className)}>
      {children}
    </span>
  );
};

export const StatusPill: React.FC<{
  tone?: 'ready' | 'risk' | 'review' | 'idle';
  children: React.ReactNode;
}> = ({ tone = 'idle', children }) => {
  const tones = {
    ready: 'chip-mint',
    risk: 'chip-sun',
    review: 'chip-accent',
    idle: '',
  };

  return (
    <span className={cn('chip', tones[tone])}>
      {children}
    </span>
  );
};
