import React from 'react';
import { INSTITUTION } from '../data/festivalData';
import { Logo } from './Logo';
import { Instagram, Youtube, Facebook, Mail, Phone, MapPin, ArrowUp, Heart, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  cmsSettings?: any;
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

const SocialLink = ({ href, label, children }: { href: string; label: string; children: React.ReactNode }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <a
      href={href}
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

export const Footer: React.FC<FooterProps> = ({ onNavigate, cmsSettings }) => {
  const [topHovered, setTopHovered] = React.useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Developer Banner (Zenith Software) */}
      <div className="bg-[#111111] py-8 sm:py-10 border-t border-b border-white/5 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
            {/* Zenith Logo with CSS Background Removal */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black/40 rounded-2xl flex items-center justify-center p-3 border border-white/5 shadow-inner">
              <img 
                src="/zenith_logo.jpg" 
                alt="Zenith Software" 
                className="w-full h-full object-contain"
                // This CSS instantly removes the white background and turns the logo into a sleek white/transparent watermark!
                style={{ mixBlendMode: 'screen', filter: 'grayscale(1) invert(1) contrast(2)' }}
              />
            </div>
            
            {/* Zenith Text */}
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2">
                <Sparkles className="w-4 h-4" style={{ color: 'var(--color-primary-accent)' }} />
                Developed by Zenith Software
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-400 max-w-lg leading-relaxed">
                For complete software solutions, web development, graphic design, and professional video editing, reach out to our expert team.
              </p>
            </div>
          </div>
          
          {/* Zenith Contact */}
          <div className="flex flex-col sm:items-end gap-2 text-[11px] sm:text-xs font-mono text-zinc-300">
            <a href="tel:+917483138340" className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group">
              <Phone className="w-3.5 h-3.5 transition-transform group-hover:scale-110" style={{ color: 'var(--color-primary-accent)' }} />
              +91 74831 38340
            </a>
            <a href="mailto:contact@zenithsoftware.com" className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group">
              <Mail className="w-3.5 h-3.5 transition-transform group-hover:scale-110" style={{ color: 'var(--color-primary-accent)' }} />
              zenithsoftware@gmail.com
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
                  title={cmsSettings?.footerLogoTitle} 
                  subtitle={cmsSettings?.footerLogoSubtitle} 
                  badge={cmsSettings?.footerLogoBadge} 
                  customIconUrl={cmsSettings?.footerLogo}
                />
              </div>
            </div>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-md pt-2">
              {cmsSettings?.footerDescription || (
                <>
                  <strong>Rendezvous Silver Edition</strong> is the flagship Imam Rabbani LIFE Festival organized by Kulliyathu Imam Rabbani, a premier off-campus institute of Markaz Garden, Poonoor.
                </>
              )}
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
              Quick Navigation
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs font-medium text-zinc-400">
              <QuickLink id="hero" label="Festival Home" onNavigate={onNavigate} />
              <QuickLink id="about" label="About & Concept" onNavigate={onNavigate} />
              <QuickLink id="results" label="Results Standings" onNavigate={onNavigate} />
              <QuickLink id="team-points" label="Team Points" onNavigate={onNavigate} />
              <QuickLink id="posters" label="Winner Posters" onNavigate={onNavigate} />
              <QuickLink id="smile" label="SMILE Photo Hub" onNavigate={onNavigate} />
              <QuickLink id="live" label="Live Stream" onNavigate={onNavigate} />
              <QuickLink id="gallery" label="Festival Gallery" onNavigate={onNavigate} />
              <QuickLink id="highlights" label="Video Highlights" onNavigate={onNavigate} />
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
          <p>{cmsSettings?.footerText || '© 2025 Kulliyathu Imam Rabbani (Markaz Garden Off-Campus). All rights reserved.'}</p>

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
