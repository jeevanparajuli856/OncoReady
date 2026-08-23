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
        return 'bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white border-indigo-200';
      case 'NURSE':
        return 'bg-gradient-to-tr from-sky-500 to-sky-700 text-white border-sky-200';
      case 'NAVIGATOR':
        return 'bg-gradient-to-tr from-teal-500 to-teal-700 text-white border-teal-200';
      case 'CAREGIVER':
        return 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white border-emerald-200';
      case 'SYSTEM':
        return 'bg-gradient-to-tr from-slate-700 to-slate-900 text-indigo-300 border-slate-600';
      default: // PATIENT
        return 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white border-indigo-200';
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
