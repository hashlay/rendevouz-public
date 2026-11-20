import React from 'react';
import { Trophy, Radio, Calendar, MapPin, ChevronRight } from 'lucide-react';

interface HeroSectionProps {
  onNavigate: (sectionId: string) => void;
  cmsSettings?: any;
  heroMedia?: any[];
  dragBlocks?: any[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, cmsSettings, heroMedia: propHeroMedia, dragBlocks }) => {
  const [desktopIndex, setDesktopIndex] = React.useState(0);
  const [mobileIndex, setMobileIndex] = React.useState(0);

  const defaultDesktopImages: string[] = [];
  const defaultMobileImages: string[] = [];

  const customDesktop = propHeroMedia?.filter(m => m.device !== 'mobile').sort((a, b) => (a.order || 0) - (b.order || 0)).map(m => m.url).filter((url): url is string => Boolean(url && typeof url === 'string' && url.trim().length > 0)) || [];
  const customMobile = propHeroMedia?.filter(m => m.device !== 'desktop').sort((a, b) => (a.order || 0) - (b.order || 0)).map(m => m.url).filter((url): url is string => Boolean(url && typeof url === 'string' && url.trim().length > 0)) || [];

  const cmsDesktop = Array.isArray(cmsSettings?.heroDesktopImages) && cmsSettings.heroDesktopImages.length > 0
    ? cmsSettings.heroDesktopImages.filter((u: any) => Boolean(u && typeof u === 'string' && u.trim().length > 0))
    : [];

  const cmsMobile = Array.isArray(cmsSettings?.heroMobileImages) && cmsSettings.heroMobileImages.length > 0
    ? cmsSettings.heroMobileImages.filter((u: any) => Boolean(u && typeof u === 'string' && u.trim().length > 0))
    : [];

  const desktopImages = customDesktop.length > 0 ? customDesktop : (cmsDesktop.length > 0 ? cmsDesktop : defaultDesktopImages);
  const mobileImages = customMobile.length > 0 ? customMobile : (cmsMobile.length > 0 ? cmsMobile : defaultMobileImages);

  React.useEffect(() => {
    if (desktopImages.length <= 1 || cmsSettings?.heroDesktopLoopEnabled === false) return;
    const interval = setInterval(() => {
      setDesktopIndex((prev) => (prev + 1) % desktopImages.length);
    }, (cmsSettings?.heroDesktopLoopInterval || 5) * 1000);
    return () => clearInterval(interval);
  }, [desktopImages.length, cmsSettings?.heroDesktopLoopEnabled, cmsSettings?.heroDesktopLoopInterval]);

  React.useEffect(() => {
    if (mobileImages.length <= 1 || cmsSettings?.heroMobileLoopEnabled === false) return;
    const interval = setInterval(() => {
      setMobileIndex((prev) => (prev + 1) % mobileImages.length);
    }, (cmsSettings?.heroMobileLoopInterval || 5) * 1000);
    return () => clearInterval(interval);
  }, [mobileImages.length, cmsSettings?.heroMobileLoopEnabled, cmsSettings?.heroMobileLoopInterval]);

  const isLiveStreamEnabled = (): boolean => {
    const blocks = dragBlocks || cmsSettings?.dragBlocks || cmsSettings?.eventSettings?.dragBlocks;
    if (Array.isArray(blocks) && blocks.length > 0) {
      const liveBlock = blocks.find((b: any) => b.type === 'live_stages' || b.type === 'live_stream' || b.id === 'live_stages' || b.id === 'live_stream');
      if (liveBlock !== undefined) {
        return !!liveBlock.enabled;
      }
    }
    if (cmsSettings?.showLiveStream === true || cmsSettings?.showLive === true) {
      return true;
    }
    return false;
  };

  return (
    <section
      id="hero"
      className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-12 sm:pb-16"
      style={{ backgroundColor: 'var(--color-body-bg, #012002)' }}
    >
      {/* Background Media */}
      <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
        {/* Mobile View */}
        <div className="block sm:hidden w-full h-full relative">
          {mobileImages.map((src, idx) => (
            <img
              key={`mob-${idx}-${src}`}
              src={src}
              alt="QUERENCIA Background"
              className={`absolute inset-0 w-full h-full object-cover filter brightness-[0.70] contrast-[1.05] transition-opacity duration-1000 ${
                idx === mobileIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block w-full h-full relative">
          {desktopImages.map((src, idx) => (
            <img
              key={`desk-${idx}-${src}`}
              src={src}
              alt="QUERENCIA Background"
              className={`absolute inset-0 w-full h-full object-cover filter brightness-[0.65] contrast-[1.05] transition-opacity duration-1000 ${
                idx === desktopIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
        </div>

        {/* Dynamic atmospheric blending based on CMS body background color */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, var(--color-body-bg, #012002) 0%, color-mix(in srgb, var(--color-body-bg, #012002) 75%, transparent) 40%, transparent 100%)'
          }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20 text-center">
        <div className="flex flex-col items-center select-none pt-2 sm:pt-4">
                    {/* 1. Main Festival Brand Title: Clean Sora Font */}
          <h1
            className="font-sora font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight uppercase select-none my-1 drop-shadow-md leading-none sm:leading-tight"
            style={{ color: 'var(--color-text-primary, #F4F8F4)' }}
          >
            {cmsSettings?.heroTitle || 'QUERENCIA'}
          </h1>

          {/* 2. Theme Subtitle: Sophisticated Literary Editorial Styling */}
          <div className="relative my-2 sm:my-3 max-w-4xl mx-auto flex items-center justify-center gap-2 sm:gap-4 px-2">
            <span
              className="hidden sm:inline-block h-[1px] w-8 sm:w-16 opacity-60 shrink-0"
              style={{ background: 'linear-gradient(to right, transparent, var(--color-primary-accent, #F5C451))' }}
            />
            <h2
              className="font-serif italic font-medium text-xl sm:text-2xl md:text-3xl lg:text-[2.6rem] tracking-normal select-none leading-tight"
              style={{
                fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
                background: 'linear-gradient(135deg, #FFFFFF 0%, var(--color-primary-accent, #F5C451) 50%, #D49B20 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 14px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 16px color-mix(in srgb, var(--color-primary-accent, #F5C451) 35%, transparent))',
                letterSpacing: '0.015em'
              }}
            >
              &ldquo;{(cmsSettings?.heroSubtitle || 'Decoding a Century of Wisdom').replace(/^[\"“']+|[\"”']+$/g, '')}&rdquo;
            </h2>
            <span
              className="hidden sm:inline-block h-[1px] w-8 sm:w-16 opacity-60 shrink-0"
              style={{ background: 'linear-gradient(to left, transparent, var(--color-primary-accent, #F5C451))' }}
            />
          </div>

          {/* 3. Campus Name Badge: Linked dynamically to CMS textSecondary / primaryAccent */}
          <div className="mt-1 sm:mt-2 mb-5 sm:mb-8">
            <span
              className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-xs font-bold tracking-[0.25em] sm:tracking-[0.35em] uppercase px-3.5 py-1 rounded-full bg-white/5 border backdrop-blur-sm select-none"
              style={{
                color: 'var(--color-primary-accent, var(--color-text-secondary, #A2D5A4))',
                borderColor: 'color-mix(in srgb, var(--color-primary-accent, #F5C451) 30%, transparent)'
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-primary-accent, #F5C451)' }} />
              {cmsSettings?.heroLogoBadge || cmsSettings?.campusName || 'THWAIBA VALLIYAD'}
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-primary-accent, #F5C451)' }} />
            </span>
          </div>

          {/* 4. Date & Venue Details Bar */}
          <div className="flex justify-center mb-5 sm:mb-8 w-full max-w-md mx-auto">
            <div
              className="inline-flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 bg-black/40 backdrop-blur-xl border px-6 sm:px-8 py-2.5 sm:py-3 rounded-full shadow-lg w-full sm:w-auto"
              style={{ borderColor: 'var(--color-border-subtle, rgba(255, 255, 255, 0.15))' }}
            >
              <div className="flex items-center gap-2 font-mono text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-primary, #F4F8F4)' }}>
                <Calendar className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary-accent, #18BA46)' }} />
                <span>{cmsSettings?.heroDate || 'November 27, 28, 29, 2026'}</span>
              </div>
              <div className="hidden sm:block w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-primary-accent, #18BA46)' }} />
              <div className="flex items-center gap-2 font-mono text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text-primary, #F4F8F4)' }}>
                <MapPin className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary-accent, #18BA46)' }} />
                <span>{cmsSettings?.heroLocation || 'Thwaiba Valliyad'}</span>
              </div>
            </div>
          </div>

          {/* Dual Action Buttons: Linked dynamically to CMS primaryAccent & borderSubtle */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-8 w-full max-w-md mx-auto sm:max-w-none">
            <button
              onClick={() => onNavigate('results')}
              style={{ backgroundColor: 'var(--color-primary-accent, #18BA46)' }}
              className="w-full sm:w-auto px-7 py-3.5 hover:brightness-110 text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-white" />
              <span>Check Live Results</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {isLiveStreamEnabled() ? (
              <button
                onClick={() => onNavigate('live')}
                className="w-full sm:w-auto px-7 py-3.5 bg-black/40 hover:bg-black/70 border text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-xl backdrop-blur-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 cursor-pointer shadow-md hover:brightness-125"
                style={{
                  borderColor: 'var(--color-primary-accent, #18BA46)',
                  color: 'var(--color-text-primary, #F4F8F4)'
                }}
              >
                <Radio className="w-4 h-4 animate-pulse" style={{ color: 'var(--color-primary-accent, #18BA46)' }} />
                <span>Watch Live Stream</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('team-points')}
                className="w-full sm:w-auto px-7 py-3.5 bg-black/40 hover:bg-black/70 border text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-xl backdrop-blur-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 cursor-pointer shadow-md hover:brightness-125"
                style={{
                  borderColor: 'var(--color-primary-accent, #18BA46)',
                  color: 'var(--color-text-primary, #F4F8F4)'
                }}
              >
                <Trophy className="w-4 h-4" style={{ color: 'var(--color-primary-accent, #18BA46)' }} />
                <span>View Team Standings</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
