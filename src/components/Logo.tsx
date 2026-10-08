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
  const rawTitle = (title !== undefined && title !== null && title !== '') ? title : 'FANOUS 2K26';
  const rawSubtitle = (subtitle !== undefined && subtitle !== null && subtitle !== '') ? subtitle : 'Meelad Fest';
  const rawBadge = (badge !== undefined && badge !== null && badge !== '') ? badge : 'Swalahul Huda Academy';

  // Dimension scales
  const scales = {
    sm: { iconSize: 36, brandSize: 'text-xl sm:text-2xl', subTextSize: 'text-[9.5px]', gap: 'gap-2.5' },
    md: { iconSize: 44, brandSize: 'text-2xl sm:text-3xl', subTextSize: 'text-xs', gap: 'gap-3' },
    lg: { iconSize: 52, brandSize: 'text-3xl sm:text-4xl', subTextSize: 'text-xs', gap: 'gap-3.5' },
    xl: { iconSize: 72, brandSize: 'text-4xl sm:text-5xl', subTextSize: 'text-sm', gap: 'gap-4' },
  };

  const { iconSize, brandSize, subTextSize, gap } = scales[size];

  return (
    <div className={`flex items-center ${gap} select-none ${className}`}>
      {/* Brand Icon */}
      {showIcon && (
        <div className="relative group shrink-0 flex items-center justify-center">
          <img
            src={customIconUrl || '/fanous_logo.jpg'}
            alt="FANOUS 2K26 Logo"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.endsWith('/fanous_logo.jpg')) {
                target.src = '/fanous_logo.jpg';
              }
            }}
            className="object-contain rounded-xl drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
            style={{ width: iconSize, height: iconSize }}
          />
          {/* Subtle purple ambient glow */}
          <div
            className="absolute inset-0 blur-lg rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ backgroundColor: 'var(--color-primary-accent, #18BA46)', opacity: 0.3 }}
          />
        </div>
      )}

      {variant !== 'icon' && (
        <div className="flex flex-col justify-center items-start text-left">
          {/* Brand Wordmark */}
          <span className={`font-sora font-extrabold uppercase text-white tracking-tight leading-none ${brandSize}`}>
            {rawTitle}
          </span>

          {/* Subtitle / Institution Badge */}
          {(rawSubtitle || rawBadge) && (
            <div className="flex items-center justify-start gap-1.5 mt-1 w-full">
              {showSubBadge && (
                <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0 animate-pulse bg-purple-400" />
              )}
              <span className={`font-sora uppercase font-semibold tracking-wider ${subTextSize} text-left text-purple-300`}>
                {rawSubtitle || rawBadge}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
