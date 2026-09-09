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
  const displayTitle = (title !== undefined && title !== null && title !== '') ? title : 'RENDEZVOUS 26';
  const displaySubtitle = (subtitle !== undefined && subtitle !== null && subtitle !== '') ? subtitle : 'IMAM RABBANI LIFE FESTIVAL';
  const displayBadge = (badge !== undefined && badge !== null && badge !== '') ? badge : 'DECODING PHYTOLORE';
  // Dimension scales
  const scales = {
    sm: { iconSize: 32, textSize: 'text-sm', subTextSize: 'text-[9px]' },
    md: { iconSize: 42, textSize: 'text-base', subTextSize: 'text-[10px]' },
    lg: { iconSize: 52, textSize: 'text-xl', subTextSize: 'text-xs' },
    xl: { iconSize: 80, textSize: 'text-3xl', subTextSize: 'text-sm' },
  };

  const { iconSize, textSize, subTextSize } = scales[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon */}
      {showIcon && (
        <div className="relative group shrink-0 flex items-center justify-center">
          <img
            src={customIconUrl || '/rendezvous_icon.png'}
            alt="Rendezvous 26 Logo"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.endsWith('/rendezvous_icon.png')) {
                target.src = '/rendezvous_icon.png';
              }
            }}
            className="object-contain rounded-xl drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
            style={{ width: iconSize, height: iconSize }}
          />
          {/* Subtle green ambient glow */}
          <div className="absolute inset-0 blur-lg rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ backgroundColor: 'var(--color-primary-accent, #18BA46)', opacity: 0.25 }} />
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
