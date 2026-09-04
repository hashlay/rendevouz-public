import React from 'react';
import { INSTITUTION } from '../data/festivalData';
import { Logo } from './Logo';
import { Instagram, Youtube, Facebook, Mail, Phone, MapPin, ArrowUp, Heart, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  cmsSettings?: any;
  dragBlocks?: any[];
}

const QuickLink = ({ id, label, onNavigate }: { id: string; label: string; onNavigate: (id: string) => void }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <li>
      <button
        onClick={() => onNavigate(id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={hovered ? { color: 'var(--color-primary-accent)' } : {}}
        className="text-zinc-400 transition-colors cursor-pointer"
      >
        {label}
      </button>
    </li>
  );
};

const ensureAbsoluteUrl = (url?: string) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//') || url.startsWith('mailto:') || url.startsWith('tel:')) return url;
  return `https://${url}`;
};

const SocialLink = ({ href, label, children }: { href: string; label: string; children: React.ReactNode }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <a
      href={ensureAbsoluteUrl(href)}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={hovered ? { backgroundColor: 'var(--color-primary-accent)', color: '#ffffff' } : {}}
      className="p-2.5 bg-white/5 text-zinc-300 rounded-xl transition-all"
      aria-label={label}
    >
      {children}
    </a>
  );
};

export const Footer: React.FC<FooterProps> = ({ onNavigate, cmsSettings, dragBlocks }) => {
  const isTypeEnabled = (types: string | string[]): boolean => {
    const blocks = dragBlocks || cmsSettings?.dragBlocks || cmsSettings?.eventSettings?.dragBlocks;
    const typeList = Array.isArray(types) ? types : [types];
    if (Array.isArray(blocks) && blocks.length > 0) {
      const found = blocks.find((b: any) => typeList.includes(b.type));
      if (found !== undefined) return !!found.enabled;
    }
    return true;
  };

  const showHero = isTypeEnabled(['hero']) && cmsSettings?.showHero !== false;
  const showAbout = isTypeEnabled(['about']) && cmsSettings?.showAbout !== false;
  const showResults = isTypeEnabled(['announcements']) && cmsSettings?.showResults !== false;
  const showTeamPoints = isTypeEnabled(['results']) && cmsSettings?.showTeamPoints !== false;
  const showPosters = isTypeEnabled(['posters']) && cmsSettings?.showPosters !== false;
  const showPhotoHub = isTypeEnabled(['smile', 'photohub']) && cmsSettings?.showPhotoHub !== false && cmsSettings?.showSmile !== false;
  const showLiveStream = isTypeEnabled(['live_stages', 'live_stream']) && cmsSettings?.showLiveStream !== false && cmsSettings?.showLive !== false;
  const showGallery = isTypeEnabled(['gallery']) && cmsSettings?.showGallery !== false;
  const showHighlights = isTypeEnabled(['highlights']) && cmsSettings?.showHighlights !== false && cmsSettings?.showVideoHighlights !== false;

  const [topHovered, setTopHovered] = React.useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Developer Banner (Zenith Software) */}
      <div className="bg-[#111111] py-4 sm:py-5 border-t border-b border-white/5 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">

          <a
            href="https://wa.me/917483138340?text=Hi!%20I%20want%20to%20build%20my%20project"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 group cursor-pointer text-center sm:text-left transition-all hover:opacity-95"
            title="Chat with Zenith Software on WhatsApp"
          >
            {/* Zenith Logo */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/40 rounded-xl flex items-center justify-center p-2 border border-white/5 shadow-inner transition-transform group-hover:scale-105 group-hover:border-white/20">
              <img
                src="/zenith_logo.jpg"
                alt="Zenith Software"
                className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                style={{ mixBlendMode: 'screen', filter: 'grayscale(1) invert(1) contrast(2)' }}
              />
            </div>

            {/* Zenith Text */}
            <div className="space-y-0.5">
              <h3 className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5 opacity-90 group-hover:text-[var(--color-primary-accent)] transition-colors">
                Developed by Zenith Software
              </h3>
              <p className="text-[9px] sm:text-[10px] text-zinc-500 max-w-sm leading-relaxed group-hover:text-zinc-300 transition-colors">
                For complete software solutions, web development, graphic design, and professional video editing, reach out to our expert team.
              </p>
            </div>
          </a>

          {/* Zenith Contact */}
          <div className="flex flex-col sm:items-end gap-1.5 text-[9px] sm:text-[10px] font-mono text-zinc-500">
            <a
              href="https://wa.me/917483138340?text=Hi!%20I%20want%20to%20build%20my%20project"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer group"
            >
              <Phone className="w-3 h-3 transition-transform group-hover:scale-110 opacity-70" style={{ color: 'var(--color-primary-accent)' }} />
              +91 74831 38340
            </a>
            <a href="mailto:zenith.theorganizer@gmail.com" className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer group">
              <Mail className="w-3 h-3 transition-transform group-hover:scale-110 opacity-70" style={{ color: 'var(--color-primary-accent)' }} />
              zenith.theorganizer@gmail.com
            </a>
          </div>

        </div>
      </div>

      <footer className="bg-[#080808] text-white pt-20 pb-12 relative overflow-hidden border-t border-white/10">
        {/* Background Watermark Wave Logo */}
        <div className="absolute -bottom-10 right-0 opacity-5 pointer-events-none select-none">
          <Logo size="xl" variant="icon" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
            {/* Col 1: Branding */}
            <div className="lg:col-span-5 space-y-4">
              <div className={`flex items-center gap-3 select-none`}>
                <div className="mb-6 md:mb-0">
                  <Logo
                    size="lg"
                    variant="full"
                    title={cmsSettings?.footerLogoTitle || 'At-Tabassum'}
                    subtitle={cmsSettings?.footerLogoSubtitle || 'Meelad Fest'}
                    badge={cmsSettings?.footerLogoBadge || 'NOORUL ISLAM MADRASA'}
                    customIconUrl={cmsSettings?.footerLogo || '/tabassum_logo.png'}
                  />
                </div>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-md pt-2">
                {cmsSettings?.footerDescription || 'At-Tabassum Meelad Fest 2026 is a vibrant celebration of talent, creativity, knowledge, and togetherness, proudly organized by Noorul Islam Madrasa, Jeppu, Mangalore, bringing students together through meaningful learning, healthy competition, and shared values.'}
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                Quick Navigation
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs font-medium text-zinc-400">
                {showHero && <QuickLink id="hero" label="Festival Home" onNavigate={onNavigate} />}
                {showAbout && <QuickLink id="about" label="About & Concept" onNavigate={onNavigate} />}
                {showResults && <QuickLink id="results" label="Results Standings" onNavigate={onNavigate} />}
                {showTeamPoints && <QuickLink id="team-points" label="Team Points" onNavigate={onNavigate} />}
                {showPosters && <QuickLink id="posters" label="Winner Posters" onNavigate={onNavigate} />}
                {showPhotoHub && <QuickLink id="smile" label="SMILE Photo Hub" onNavigate={onNavigate} />}
                {showLiveStream && <QuickLink id="live" label="Live Stream" onNavigate={onNavigate} />}
                {showGallery && <QuickLink id="gallery" label="Festival Gallery" onNavigate={onNavigate} />}
                {showHighlights && <QuickLink id="highlights" label="Video Highlights" onNavigate={onNavigate} />}
              </ul>
            </div>

            {/* Col 3: Contact & Socials */}
            <div className="lg:col-span-4 space-y-4">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                Institutional Contact
              </h4>

              <div className="space-y-2.5 text-xs text-zinc-300 font-mono">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary-accent)' }} />
                  <span>{cmsSettings?.footerLocation || INSTITUTION.location}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary-accent)' }} />
                  <span>{cmsSettings?.footerEmail || INSTITUTION.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary-accent)' }} />
                  <span>{cmsSettings?.footerPhone || INSTITUTION.phone}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-mono text-zinc-500 block mb-2 uppercase">
                  Connect With Us
                </span>
                <div className="flex items-center gap-3">
                  <SocialLink href={cmsSettings?.footerInstagram || INSTITUTION.socials.instagram} label="Instagram">
                    <Instagram className="w-4 h-4" />
                  </SocialLink>
                  <SocialLink href={cmsSettings?.footerYoutube || INSTITUTION.socials.youtube} label="YouTube">
                    <Youtube className="w-4 h-4" />
                  </SocialLink>
                  <SocialLink href={cmsSettings?.footerFacebook || INSTITUTION.socials.facebook} label="Facebook">
                    <Facebook className="w-4 h-4" />
                  </SocialLink>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
            <p>{cmsSettings?.footerText || cmsSettings?.copyrightText || '© 2026 Noorul Islam Madrasa Jeppu. All rights reserved. Developed by Zenith.'}</p>

            <button
              onClick={scrollToTop}
              onMouseEnter={() => setTopHovered(true)}
              onMouseLeave={() => setTopHovered(false)}
              style={topHovered ? { backgroundColor: 'var(--color-primary-accent)', color: '#ffffff' } : {}}
              className="p-3 bg-white/5 text-zinc-400 rounded-full transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="text-[10px] uppercase font-bold">Back to top</span>
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};
