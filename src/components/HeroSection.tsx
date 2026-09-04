import React from 'react';
import { INSTITUTION } from '../data/festivalData';
import { Trophy, Radio, Calendar, MapPin, ChevronRight, Settings } from 'lucide-react';
import { Logo } from './Logo';
import { useFestival } from '../context/FestivalContext';

interface HeroSectionProps {
  onNavigate: (sectionId: string) => void;
  cmsSettings?: any;
  heroMedia?: any[];
  dragBlocks?: any[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, cmsSettings, heroMedia: propHeroMedia, dragBlocks }) => {
  const { authUser, setActiveModalView } = useFestival();
  const [desktopIndex, setDesktopIndex] = React.useState(0);
  const [mobileIndex, setMobileIndex] = React.useState(0);
  
  const customDesktop = propHeroMedia?.filter(m => m.device !== 'mobile').sort((a,b) => (a.order || 0) - (b.order || 0)).map(m => m.url).filter((url): url is string => Boolean(url && typeof url === 'string' && url.trim().length > 0)) || [];
  const customMobile = propHeroMedia?.filter(m => m.device !== 'desktop').sort((a,b) => (a.order || 0) - (b.order || 0)).map(m => m.url).filter((url): url is string => Boolean(url && typeof url === 'string' && url.trim().length > 0)) || [];
  
  // Directly use uploaded media. Fallback to default responsive video if zero custom images.
  const desktopImages = customDesktop;
  const mobileImages = customMobile;
  const hasCustomDesktop = desktopImages.length > 0;
  const hasCustomMobile = mobileImages.length > 0;

  const handleVideoRef = (el: HTMLVideoElement | null) => {
    if (el) {
      el.muted = true;
      el.play().catch(() => {
        // Autoplay restricted fallback - hero background remains visible
      });
    }
  };
  
  React.useEffect(() => {
    if (desktopImages.length <= 1 || cmsSettings?.heroDesktopLoopEnabled === false) return;
    const interval = setInterval(() => {
      setDesktopIndex((prev) => (prev + 1) % desktopImages.length);
    }, (cmsSettings?.heroDesktopLoopInterval || 3) * 1000);
    return () => clearInterval(interval);
  }, [desktopImages.length, cmsSettings?.heroDesktopLoopEnabled, cmsSettings?.heroDesktopLoopInterval]);

  React.useEffect(() => {
    if (mobileImages.length <= 1 || cmsSettings?.heroMobileLoopEnabled === false) return;
    const interval = setInterval(() => {
      setMobileIndex((prev) => (prev + 1) % mobileImages.length);
    }, (cmsSettings?.heroMobileLoopInterval || 3) * 1000);
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

  const formatHeroTitle = (title: string) => {
    let formatted = title
      .replace(/#FF2B2B/gi, 'var(--color-primary-accent)')
      .replace(/#ff2b2b/gi, 'var(--color-primary-accent)')
      .replace(/text-\[#FF2B2B\]/gi, '')
      .replace(/text-[#FF2B2B]/gi, '')
      .replace(/text-red-\d+/gi, '')
      .replace(/<span([^>]*)>/gi, (m, p1) => {
        if (p1.includes('style=')) {
          return `<span ${p1.replace(/style="([^"]*)"/gi, 'style="$1; color: var(--color-primary-accent)"')}>`;
        }
        return `<span ${p1} style="color: var(--color-primary-accent)">`;
      });

    // Ensure two-line stacked layout like Image 1 and Image 3 if not already broken
    if (!formatted.includes('<br') && !formatted.includes('display: block') && !formatted.includes('class="block')) {
      if (formatted.includes('<span')) {
        formatted = formatted.replace('<span', '<br /><span class="block"');
      } else if (formatted.toUpperCase().includes('TABASSUM') && formatted.toUpperCase().includes('MEELAD FEST')) {
        formatted = formatted.replace(/TABASSUM\s+MEELAD\s+FEST/i, 'TABASSUM<br /><span class="block" style="color: var(--color-primary-accent)">MEELAD FEST</span>');
      }
    }
    return formatted;
  };

  return (
    <section id="hero" className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A] pt-24 pb-16">
      {/* Background Media */}
      <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
        {/* Mobile View */}
        <div className="block sm:hidden w-full h-full">
          {hasCustomMobile ? (
            <img 
              src={mobileImages[mobileIndex]} 
              alt="Festival Atmosphere"
              className="w-full h-full object-cover filter brightness-[0.75] contrast-[1.05]"
            />
          ) : (
            <video
              ref={handleVideoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover filter brightness-[0.75] contrast-[1.05]"
            >
              <source src="/videos/tabassum-hero-mobile.mp4" type="video/mp4" />
            </video>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block w-full h-full">
          {hasCustomDesktop ? (
            <img 
              src={desktopImages[desktopIndex]} 
              alt="Festival Atmosphere"
              className="w-full h-full object-cover filter brightness-[0.75] contrast-[1.05]"
            />
          ) : (
            <video
              ref={handleVideoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover filter brightness-[0.75] contrast-[1.05]"
            >
              <source src="/videos/tabassum-hero-desktop.mp4" type="video/mp4" />
            </video>
          )}
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-[#0A0A0A]" />
      </div>

      {/* Admin Quick Action Button */}
      {authUser && (authUser.role === 'admin' || authUser.role === 'superadmin') && (
        <div className="absolute top-24 right-4 sm:right-8 z-30 bg-black/60 border border-white/10 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg">
          <button
            onClick={() => setActiveModalView('admin-dashboard')}
            className="text-[10px] text-amber-400 font-mono hover:underline flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" /> Manage Hero Media
          </button>
        </div>
      )}

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20 text-center">
        {cmsSettings?.heroHideLogo === false && (
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="scale-75 sm:scale-100 flex items-center justify-center p-4">
              <Logo 
                size="xl" 
                variant="full" 
                title={cmsSettings?.heroLogoTitle} 
                subtitle={cmsSettings?.heroLogoSubtitle} 
                badge={cmsSettings?.heroLogoBadge} 
                customIconUrl={cmsSettings?.heroLogo}
              />
            </div>
          </div>
        )}

        {/* Dynamic Titles from CMS or fallback */}
        <div className="flex flex-col items-center">
          {cmsSettings?.heroTitle ? (
            <h1
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight flex flex-col items-center mb-3 sm:mb-5 uppercase font-display text-center"
              dangerouslySetInnerHTML={{
                __html: formatHeroTitle(cmsSettings.heroTitle)
              }}
            />
          ) : (
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tight max-w-4xl mx-auto leading-[0.95] mb-3 sm:mb-5 drop-shadow-md text-center font-display flex flex-col items-center">
              <span className="block">TABASSUM</span>
              <span className="block font-black" style={{ color: 'var(--color-primary-accent)' }}>
                MEELAD FEST
              </span>
            </h1>
          )}

          <p className="text-sm sm:text-xl font-light text-zinc-200 tracking-wide mb-2 sm:mb-3 font-sans drop-shadow-sm max-w-2xl mx-auto text-center">
            {cmsSettings?.heroSubtitle || INSTITUTION.subTitle}
          </p>

          {/* Institutional Credit Tag */}
          <p className="text-[11px] sm:text-xs font-medium text-zinc-300 max-w-xl mx-auto mb-6 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap drop-shadow-sm text-center">
            <span style={{ color: 'var(--color-primary-accent)' }} className="font-bold">{cmsSettings?.heroInstitutionLeft || INSTITUTION.name}</span>
            <span className="text-zinc-500">•</span>
            <span>{cmsSettings?.heroInstitutionRight || INSTITUTION.tagline}</span>
          </p>
          
          <div className="flex justify-center mb-8 sm:mb-10">
            <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 bg-black/60 backdrop-blur-xl border border-white/10 px-6 sm:px-8 py-3 rounded-full shadow-2xl">
              <div className="flex items-center gap-2 text-zinc-300 font-mono text-[10px] sm:text-xs">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: 'var(--color-primary-accent)' }} />
                <span>{cmsSettings?.heroDate || INSTITUTION.dates}</span>
              </div>
              <div className="hidden sm:block w-1.5 h-1.5 rounded-full opacity-40" style={{ backgroundColor: 'var(--color-primary-accent)' }} />
              <div className="flex items-center gap-2 text-zinc-300 font-mono text-[10px] sm:text-xs">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: 'var(--color-primary-accent)' }} />
                <span>{cmsSettings?.heroLocation || INSTITUTION.location}</span>
              </div>
            </div>
          </div>

          {/* Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-10 max-w-md mx-auto sm:max-w-none">
            <button
              onClick={() => onNavigate('results')}
              style={{ backgroundColor: 'var(--color-primary-accent)' }}
              className="w-full sm:w-auto px-6 py-3.5 hover:brightness-110 text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-white" />
              <span>Check Live Results</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {isLiveStreamEnabled() ? (
              <button
                onClick={() => onNavigate('live')}
                className="w-full sm:w-auto px-6 py-3.5 bg-black/60 hover:bg-black/80 border border-white/30 hover:border-white/60 text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-xl backdrop-blur-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Radio className="w-4 h-4 animate-pulse" style={{ color: 'var(--color-primary-accent)' }} />
                <span>Watch Live Stream</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('standings')}
                className="w-full sm:w-auto px-6 py-3.5 bg-black/60 hover:bg-black/80 border border-white/30 hover:border-white/60 text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-xl backdrop-blur-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Trophy className="w-4 h-4" style={{ color: 'var(--color-primary-accent)' }} />
                <span>View Team Standings</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
