import React, { useState } from 'react';
import { User, Stethoscope, HeartHandshake, ShieldCheck } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  roleType?: 'PATIENT' | 'NURSE' | 'NAVIGATOR' | 'DOCTOR' | 'CAREGIVER' | 'SYSTEM';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  roleType = 'PATIENT',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-18 h-18 text-lg',
  };

  const getRoleColors = () => {
    switch (roleType) {
      case 'DOCTOR':
        return 'bg-accent text-white border-ink';
      case 'NURSE':
        return 'bg-sun text-ink border-ink';
      case 'NAVIGATOR':
        return 'bg-mint text-ink border-ink';
      case 'CAREGIVER':
        return 'bg-pop text-white border-ink';
      case 'SYSTEM':
        return 'bg-ink text-sun border-ink';
      default: // PATIENT
        return 'bg-accent text-white border-ink';
    }
  };

  const getRoleIcon = () => {
    switch (roleType) {
      case 'DOCTOR':
      case 'NURSE':
        return <Stethoscope className="w-1/2 h-1/2" />;
      case 'CAREGIVER':
        return <HeartHandshake className="w-1/2 h-1/2" />;
      case 'SYSTEM':
        return <ShieldCheck className="w-1/2 h-1/2" />;
      default:
        return <User className="w-1/2 h-1/2" />;
    }
  };

  const initials = alt
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (!src || imgError) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-2xl flex items-center justify-center font-bold border shadow-xs select-none shrink-0 ${getRoleColors()} ${className}`}
        title={alt}
      >
        {initials ? initials : getRoleIcon()}
      </div>
    );
  }

  return (
    <div className={`relative shrink-0 ${className}`}>
      <img
        src={src}
        alt={alt}
        onError={() => setImgError(true)}
        className={`${sizeClasses[size]} rounded-2xl object-cover border border-slate-200 shadow-xs`}
        loading="lazy"
      />
    </div>
  );
};
