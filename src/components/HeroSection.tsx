import React from 'react';
import { INSTITUTION } from '../data/festivalData';
import { Trophy, Radio, Calendar, MapPin, ChevronRight, Settings } from 'lucide-react';
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

  const defaultDesktopImages = ['/fanous_hero_desktop.jpg'];
  const defaultMobileImages = ['/fanous_hero_mobile.jpg'];

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
    <section id="hero" className="relative min-h-[100dvh] flex flex-col justify-center items-center overflow-hidden bg-[#012002] pt-24 pb-8 sm:py-24">
      {/* Background Media */}
      <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
        {/* Mobile View */}
        <div className="block sm:hidden w-full h-full relative">
          {mobileImages.map((src, idx) => (
            <img
              key={`mob-${idx}-${src}`}
              src={src}
              alt="FANOUS 2K26 Background"
              className={`absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.70] contrast-[1.05] transition-opacity duration-1000 ${
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
              alt="FANOUS 2K26 Background"
              className={`absolute inset-0 w-full h-full object-cover filter brightness-[0.65] contrast-[1.05] transition-opacity duration-1000 ${
                idx === desktopIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
        </div>

        {/* Subtle atmospheric blending */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#012002]/80 via-[#012002]/20 to-transparent pointer-events-none" />
      </div>

      {/* Admin Quick Action Button */}
      {authUser && (authUser.role === 'admin' || authUser.role === 'superadmin') && (
        <div className="absolute top-24 right-4 sm:right-8 z-30 bg-black/50 border border-emerald-500/30 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg">
          <button
            onClick={() => setActiveModalView('admin-dashboard')}
            className="text-[10px] text-emerald-400 font-mono hover:underline flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" /> Manage Hero Media
          </button>
        </div>
      )}

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20 text-center flex-1 flex flex-col justify-between sm:justify-center items-center pt-2 sm:pt-4 pb-3 sm:pb-8">
        {/* Upper Brand & Details Group: Centered in available upper area */}
        <div className="flex flex-col items-center select-none w-full my-auto sm:my-0">
          {/* 1. Main Festival Brand Title: Clean Sora Font */}
          <h1 className="font-sora font-extrabold text-[#F4F8F4] text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight uppercase select-none my-1 sm:my-1.5 drop-shadow-md leading-none sm:leading-tight">
            {cmsSettings?.heroTitle || 'FANOUS 2K26'}
          </h1>

          {/* 2. Theme Subtitle: Meelad Fest (Semi-bold, 5% smaller than Fanous 2K26) */}
          <h2
            className="font-sora font-semibold text-[2.4rem] sm:text-[3.4rem] md:text-[4.2rem] lg:text-[5.6rem] tracking-tight select-none my-1 sm:my-1.5 leading-none sm:leading-tight drop-shadow-sm"
            style={{ color: 'var(--color-primary-accent, #18BA46)' }}
          >
            {(cmsSettings?.heroSubtitle || 'Meelad Fest').replace(/^["“']+|["”']+$/g, '')}
          </h2>

          {/* 3. Campus Name Badge */}
          <p className="font-sora text-xs sm:text-sm md:text-base font-bold text-[#A2D5A4] tracking-[0.25em] sm:tracking-[0.35em] uppercase mt-2 sm:mt-3 mb-5 sm:mb-8 select-none">
            {cmsSettings?.heroLogoBadge || cmsSettings?.campusName || 'SWALAHUL HUDA ACADEMY'}
          </p>

          {/* 4. Date & Venue Details Bar */}
          <div className="flex justify-center mb-4 sm:mb-10 w-full max-w-md mx-auto">
            <div
              className="inline-flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 bg-black/40 backdrop-blur-xl border px-6 sm:px-8 py-2.5 sm:py-3 rounded-full shadow-lg w-full sm:w-auto"
              style={{ borderColor: 'var(--color-border-subtle, #176523)' }}
            >
              <div className="flex items-center gap-2 text-[#F4F8F4] font-mono text-xs sm:text-sm font-medium">
                <Calendar className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary-accent, #18BA46)' }} />
                <span>{cmsSettings?.heroDate || 'October 9, 2026'}</span>
              </div>
              <div className="hidden sm:block w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-primary-accent, #18BA46)' }} />
              <div className="flex items-center gap-2 text-[#F4F8F4] font-mono text-xs sm:text-sm font-medium">
                <MapPin className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary-accent, #18BA46)' }} />
                <span>{cmsSettings?.heroLocation || 'Rifayiya Juma Masjid Muchila'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dual Action Buttons: Anchored near bottom with consistent modest gap on all mobile screens */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md mx-auto sm:max-w-none mt-auto sm:mt-6 pb-2 sm:pb-0">
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
              className="w-full sm:w-auto px-7 py-3.5 bg-black/40 hover:bg-black/70 border text-[#F4F8F4] text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-xl backdrop-blur-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 cursor-pointer shadow-md hover:border-emerald-400/60"
              style={{ borderColor: 'var(--color-border-subtle, #176523)' }}
            >
              <Radio className="w-4 h-4 animate-pulse" style={{ color: 'var(--color-primary-accent, #18BA46)' }} />
              <span>Watch Live Stream</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('team-points')}
              className="w-full sm:w-auto px-7 py-3.5 bg-black/40 hover:bg-black/70 border text-[#F4F8F4] text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-xl backdrop-blur-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 cursor-pointer shadow-md hover:border-emerald-400/60"
              style={{ borderColor: 'var(--color-border-subtle, #176523)' }}
            >
              <Trophy className="w-4 h-4" style={{ color: 'var(--color-primary-accent, #18BA46)' }} />
              <span>View Team Standings</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
