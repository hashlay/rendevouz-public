import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Trophy, Radio, Menu, X, User, Lock, ScanFace, ShieldCheck, Code, Settings } from 'lucide-react';
import { useFestival } from '../context/FestivalContext';

interface HeaderProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  cmsSettings?: any;
  dragBlocks?: any[];
}

export const Header: React.FC<HeaderProps> = ({ activeSection, onNavigate, cmsSettings, dragBlocks }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { authUser, openLoginModal, setActiveModalView } = useFestival();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDynamicNavLinks = () => {
    const defaultLinks: { id: string; label: string; isLive?: boolean; badge?: string }[] = [
      { id: 'hero', label: 'Home' },
      { id: 'about', label: 'About' },
      { id: 'results', label: 'Results' },
      { id: 'team-points', label: 'Team Points' },
      { id: 'posters', label: 'Posters' },
      { id: 'smile', label: 'Photo Hub' },
    ];

    const blocks = dragBlocks || cmsSettings?.dragBlocks || cmsSettings?.layoutSections;
    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
      return defaultLinks;
    }

    const enabledBlocks = blocks.filter((b: any) => b.enabled !== false).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    const links: { id: string; label: string; isLive?: boolean; badge?: string }[] = [];
    links.push({ id: 'hero', label: 'Home' });

    enabledBlocks.forEach((block: any) => {
      const type = block.type || block.id;
      if (type === 'about') {
        links.push({ id: 'about', label: 'About' });
      } else if (type === 'announcements' || type === 'results_announced') {
        links.push({ id: 'results', label: 'Results' });
      } else if (type === 'results' || type === 'standings') {
        links.push({ id: 'team-points', label: 'Team Points' });
      } else if (type === 'smile' || type === 'photohub') {
        links.push({ id: 'smile', label: 'Photo Hub' });
      } else if (type === 'gallery') {
        links.push({ id: 'gallery', label: 'Gallery' });
      } else if (type === 'live_stream' || type === 'live_stages') {
        links.push({ id: 'live', label: 'Live Stream' });
      } else if (type === 'highlights') {
        links.push({ id: 'highlights', label: 'Highlights' });
      }
    });

    if (!links.some(l => l.id === 'posters')) {
      links.splice(Math.min(4, links.length), 0, { id: 'posters', label: 'Posters' });
    }

    return links;
  };

  const navLinks = getDynamicNavLinks();

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const handleUserPillClick = () => {
    if (!authUser || authUser.role !== 'participant') {
      openLoginModal('participant');
    } else {
      setActiveModalView('participant-profile');
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || mobileMenuOpen
          ? 'bg-black/80 backdrop-blur-md border-b border-white/10 shadow-lg py-3'
          : 'bg-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo & Institution Branding */}
        <div
          onClick={() => handleLinkClick('hero')}
          className="cursor-pointer group flex items-center gap-3"
        >
          <Logo
            size="md"
            showSubBadge={false}
            title={cmsSettings?.headerLogoTitle || cmsSettings?.heroLogoTitle}
            subtitle={cmsSettings?.headerLogoSubtitle || cmsSettings?.heroLogoSubtitle}
            customIconUrl={cmsSettings?.headerLogo || cmsSettings?.heroLogo}
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 bg-black/40 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-lg">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                style={isActive ? { backgroundColor: 'var(--color-primary-accent)' } : {}}
                className={`relative px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 ${isActive
                    ? 'text-white shadow-lg'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                  }`}
              >
                {link.isLive && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: 'var(--color-primary-accent)' }}></span>
                  </span>
                )}
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Participant Login Pill Button */}
          <button
            onClick={handleUserPillClick}
            style={{ backgroundColor: 'var(--color-primary-accent)' }}
            className="px-4.5 py-2 text-xs font-extrabold text-white hover:opacity-90 rounded-full flex items-center gap-2 transition-all shadow-lg hover:scale-105 cursor-pointer"
          >
            {authUser && authUser.role === 'participant' ? (
              <>
                {authUser.avatarUrl ? (
                  <img src={authUser.avatarUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
                <span>{authUser.participant?.codeNumber || authUser.name}</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5" />
                <span>Participant Login</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            onClick={handleUserPillClick}
            className="px-2.5 py-1.5 text-[10px] font-bold text-white bg-white/10 border border-white/20 rounded-full flex items-center gap-1"
          >
            <User className="w-3 h-3" />
            <span>{authUser ? 'Profile' : 'Login'}</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-300 hover:text-white bg-white/5 border border-white/10 rounded-xl"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-b border-white/10 backdrop-blur-xl px-4 py-6 mt-2 space-y-2 animate-in slide-in-from-top duration-200"
          style={{ backgroundColor: 'var(--color-body-bg, #0D0D0D)' }}
        >
          <div className="text-xs uppercase tracking-widest text-zinc-500 font-mono px-3 mb-2">
            Navigation Menu
          </div>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              style={activeSection === link.id ? { color: 'var(--color-primary-accent)', borderColor: 'var(--color-primary-accent)' } : {}}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between ${activeSection === link.id
                  ? 'bg-white/10 border font-semibold'
                  : 'text-zinc-300 hover:bg-white/5'
                }`}
            >
              <div className="flex items-center gap-2">
                {link.isLive && <Radio className="w-4 h-4 animate-pulse" style={{ color: 'var(--color-primary-accent)' }} />}
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <span className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-primary-accent)' }}>
                  {link.badge}
                </span>
              )}
            </button>
          ))}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <button
              onClick={() => { handleUserPillClick(); setMobileMenuOpen(false); }}
              className="w-full py-2.5 bg-white/10 border border-white/20 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" style={{ color: 'var(--color-primary-accent)' }} />
              <span>{authUser ? 'My Dashboard & Profile' : 'Participant / Management Login'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

