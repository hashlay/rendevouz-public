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

  const defaultDesktopImages = ['/rendezvous_hero_desktop.jpg', '/hero1.jpg', '/hero2.jpg'];
  const defaultMobileImages = ['/rendezvous_hero_mobile.jpg', '/hero1_mobile.jpg', '/hero2_mobile.jpg'];

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

    // Replace any legacy Tabassum text with Rendezvous 26
    if (formatted.toUpperCase().includes('TABASSUM')) {
      formatted = formatted.replace(/(?:At-)?tabassum(?:\s+MEELAD\s+FEST)?/i, 'RENDEZVOUS<br /><span class="block" style="color: var(--color-primary-accent)">26</span>');
    }

    // Ensure two-line stacked layout for Rendezvous 26
    if (!formatted.includes('<br') && !formatted.includes('display: block') && !formatted.includes('class="block')) {
      if (formatted.includes('<span')) {
        formatted = formatted.replace('<span', '<br /><span class="block"');
      } else if (formatted.toUpperCase().includes('RENDEZVOUS') && formatted.includes('26')) {
        formatted = formatted.replace(/RENDEZVOUS\s+26/i, 'RENDEZVOUS<br /><span class="block" style="color: var(--color-primary-accent)">26</span>');
      }
    }
    return formatted;
  };

  return (
    <section id="hero" className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A] pt-24 pb-16">
      {/* Background Media */}
      <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
        {/* Mobile View */}
        <div className="block sm:hidden w-full h-full relative">
          {mobileImages.map((src, idx) => (
            <img
              key={`mob-${idx}-${src}`}
              src={src}
              alt="Rendezvous 26 Atmosphere"
              className={`absolute inset-0 w-full h-full object-cover filter brightness-[0.65] contrast-[1.1] transition-opacity duration-1000 ${
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
              alt="Rendezvous 26 Atmosphere"
              className={`absolute inset-0 w-full h-full object-cover filter brightness-[0.65] contrast-[1.1] transition-opacity duration-1000 ${
                idx === desktopIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
        </div>

        {/* Gradient overlays matching new green theme */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-body-bg)] via-[var(--color-body-bg)]/60 to-[var(--color-body-bg)]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[var(--color-body-bg)]/30 to-[var(--color-body-bg)]" />
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
              <span className="block">RENDEZVOUS</span>
              <span className="block font-black" style={{ color: 'var(--color-primary-accent)' }}>
                26
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
