import React from 'react';
import { INSTITUTION } from '../data/festivalData';
import { Trophy, Radio, Calendar, MapPin, ChevronRight, Settings } from 'lucide-react';
import { Logo } from './Logo';
import { useFestival } from '../context/FestivalContext';

interface HeroSectionProps {
  onNavigate: (sectionId: string) => void;
  cmsSettings?: any;
  heroMedia?: any[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, cmsSettings, heroMedia: propHeroMedia }) => {
  const { authUser, setActiveModalView } = useFestival();
  const [desktopIndex, setDesktopIndex] = React.useState(0);
  const [mobileIndex, setMobileIndex] = React.useState(0);
  
  const desktopImages = cmsSettings?.heroDesktopImages?.length > 0 ? cmsSettings.heroDesktopImages : ['/hero1.jpg', '/hero2.jpg'];
  const mobileImages = cmsSettings?.heroMobileImages?.length > 0 ? cmsSettings.heroMobileImages : [];
  
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

  return (
    <section id="hero" className="relative min-h-[85vh] sm:min-h-screen pt-20 sm:pt-28 pb-12 sm:pb-16 flex items-center justify-center overflow-hidden bg-[#0D0D0D]">
      {/* 
        Hero Background Layer:
        - Mobile (<768px): Normal static background image fitted to screen (No looping/video on mobile as requested).
        - Desktop (>=768px): Continuous cycling video/photo media loop.
      */}
      
      {/* Mobile Background (<768px) */}
      <div className="block md:hidden absolute inset-0 z-0 overflow-hidden">
        {mobileImages.map((url: string, index: number) => (
          <div
            key={url + index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === mobileIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={url}
              alt="Festival Background Mobile"
              className="w-full h-full object-cover object-center brightness-90 contrast-105"
            />
          </div>
        ))}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/60 to-black/30 pointer-events-none" />
      </div>

      {/* Desktop Cycling Media Loop (>=768px) */}
      <div className="hidden md:block absolute inset-0 z-0 overflow-hidden">
        {desktopImages.map((url: string, index: number) => (
          <div
            key={url + index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === desktopIndex ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0 pointer-events-none'
            }`}
          >
            <img
              src={url}
              alt="Festival Background Desktop"
              className="w-full h-full object-cover object-center brightness-100 opacity-100 transform scale-100 transition-transform duration-1000"
            />
          </div>
        ))}

        {/* Minimal Bottom Vignette to Ensure Readable Text */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/30 to-black/20 pointer-events-none" />
        <div className="absolute inset-0 z-10 bg-radial-vignette pointer-events-none opacity-40" />

        {/* Background wave grid patterns */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-white/10 to-transparent blur-[140px] rounded-full opacity-30" />
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="wave-pattern" width="120" height="80" patternUnits="userSpaceOnUse">
                <path d="M 0 40 C 30 20, 60 60, 90 40 C 105 30, 115 50, 120 40" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-white/15" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#wave-pattern)" />
          </svg>
        </div>
      </div>

      {/* Background Media Manager Button for Admin */}
      {(authUser?.role === 'developer' || authUser?.role === 'committee') && (
        <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center bg-black/70 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-md">
          <button
            onClick={() => setActiveModalView('admin-dashboard')}
            className="text-[10px] text-amber-400 font-mono hover:underline flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" /> Manage Hero Media
          </button>
        </div>
      )}

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20 text-center">
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

        {/* Dynamic Titles from CMS or fallback */}
        <div className="flex flex-col items-center">
          {cmsSettings?.heroTitle ? (
            <h1
              className="text-[32px] xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight flex flex-col items-center mb-4 sm:mb-6 uppercase font-display text-center"
              dangerouslySetInnerHTML={{
                __html: cmsSettings.heroTitle
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
                  })
              }}
            />
          ) : (
            <>
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white uppercase tracking-tight max-w-4xl mx-auto leading-tight mb-2 sm:mb-4 drop-shadow-md text-center">
                REN<span style={{ color: 'var(--color-primary-accent)' }}>DEZVOUS</span>{' '}
                <span className="font-extrabold block sm:inline" style={{ color: 'var(--color-primary-accent)' }}>SILVER EDITION</span>
              </h1>
            </>
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
          
          {cmsSettings?.heroSubtitle && (
            <div className="inline-flex items-center justify-center bg-black/60 backdrop-blur-xl border border-white/10 px-5 sm:px-8 py-2 sm:py-3 rounded-full shadow-2xl mb-8 sm:mb-10 w-[90%] sm:w-auto">
              <span className="text-xs sm:text-base md:text-lg text-zinc-300 font-mono tracking-widest uppercase truncate max-w-full">
                {cmsSettings?.heroSubtitle}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-10 sm:mb-12">
          <div className="flex items-center gap-2 text-zinc-400 font-mono text-[10px] sm:text-xs">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: 'var(--color-primary-accent)' }} />
            <span>{cmsSettings?.heroDate || INSTITUTION.dates}</span>
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full opacity-40" style={{ backgroundColor: 'var(--color-primary-accent)' }} />
          <div className="flex items-center gap-2 text-zinc-400 font-mono text-[10px] sm:text-xs">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: 'var(--color-primary-accent)' }} />
            <span>{cmsSettings?.heroLocation || INSTITUTION.location}</span>
          </div>
        </div>

        {/* Dual Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6 sm:mb-10 max-w-md mx-auto sm:max-w-none">
          <button
            onClick={() => onNavigate('results')}
            style={{ backgroundColor: 'var(--color-primary-accent)' }}
            className="w-full sm:w-auto px-6 py-3 hover:opacity-90 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-white" />
            <span>Check Live Results</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onNavigate('live')}
            className="w-full sm:w-auto px-6 py-3 bg-black/60 hover:bg-black/80 border border-white/30 hover:border-white/60 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl backdrop-blur-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Radio className="w-4 h-4 animate-pulse" style={{ color: 'var(--color-primary-accent)' }} />
            <span>Watch Live Stream</span>
          </button>
        </div>
      </div>
    </section>
  );
};
