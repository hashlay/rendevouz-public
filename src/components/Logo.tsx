import React from 'react';

interface LogoProps {
  className?: string;
  showSubBadge?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'watermark';
  title?: string;
  subtitle?: string;
  badge?: string;
  showIcon?: boolean;
  customIconUrl?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showSubBadge = true,
  size = 'md',
  variant = 'full',
  title,
  subtitle,
  badge,
  showIcon = true,
  customIconUrl = '',
}) => {
  const displayTitle = (title !== undefined && title !== null && title !== '') ? title : 'At-Tabassum';
  const displaySubtitle = (subtitle !== undefined && subtitle !== null && subtitle !== '') ? subtitle : 'MEELAD FEST';
  const displayBadge = (badge !== undefined && badge !== null && badge !== '') ? badge : 'NOORUL ISLAM MADRASA';
  // Dimension scales
  const scales = {
    sm: { iconWidth: 42, iconHeight: 24, textSize: 'text-sm', subTextSize: 'text-[9px]' },
    md: { iconWidth: 56, iconHeight: 32, textSize: 'text-base', subTextSize: 'text-[10px]' },
    lg: { iconWidth: 80, iconHeight: 46, textSize: 'text-xl', subTextSize: 'text-xs' },
    xl: { iconWidth: 120, iconHeight: 68, textSize: 'text-3xl', subTextSize: 'text-sm' },
  };

  const { iconWidth, iconHeight, textSize, subTextSize } = scales[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon */}
      {showIcon && (
        <div className="relative group shrink-0 flex items-center justify-center">
          <img
            src={customIconUrl || '/At-Tabassum_logo.jpg'}
            alt="At-Tabassum Meelad Fest Logo"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src.includes('At-Tabassum_logo.jpg')) {
                target.src = '/At-Tabassum_logo.png';
              }
            }}
            className="object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
            style={{ width: iconWidth, height: iconHeight, borderRadius: '50%' }}
          />
          {/* Subtle gold ambient glow */}
          <div className="absolute inset-0 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ backgroundColor: 'var(--color-primary-accent, #C89A4B)', opacity: 0.2 }} />
        </div>
      )}

      {variant !== 'icon' && (
        <div className="flex flex-col justify-center items-start text-left">
          <div className="flex flex-col leading-none tracking-tight items-start">
            <span className={`font-black uppercase tracking-tight text-white ${textSize} font-sans`}>
              {displayTitle}
            </span>
            <span className={`font-semibold tracking-wide text-zinc-300 ${textSize} opacity-90`}>
              {displaySubtitle}
            </span>
          </div>

          {showSubBadge && (
            <div className="flex items-center justify-start gap-1.5 mt-1 w-full">
              <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: 'var(--color-primary-accent)' }} />
              <span className={`uppercase font-bold tracking-wider ${subTextSize} text-left`} style={{ color: 'var(--color-primary-accent)' }}>
                {displayBadge}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
