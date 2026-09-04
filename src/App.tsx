import React, { useState } from 'react';
import { FestivalProvider, useFestival } from './context/FestivalContext';
import { Category } from './types';

import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { SmilePhotoPortal } from './components/SmilePhotoPortal';
import { LiveStreamSection } from './components/LiveStreamSection';
import { GallerySection } from './components/GallerySection';
import { VideoHighlights } from './components/VideoHighlights';
import { ResultsSection } from './components/ResultsSection';
import { FullConceptModal } from './components/FullConceptModal';
import { LoginModal } from './components/LoginModal';
import { ParticipantProfileModal } from './components/ParticipantProfileModal';
import { FaceScannerModal } from './components/FaceScannerModal';
import { PublishedResultsPage } from './components/PublishedResultsPage';
import { TeamPointsPage } from './components/TeamPointsPage';
import { PublicPostersPage } from './components/PublicPostersPage';
import { PublicGalleryPage } from './components/PublicGalleryPage';
import { Footer } from './components/Footer';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: Readonly<ErrorBoundaryProps>;
  public state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught React Error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch (_) {}
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#18181C] border border-[#2D2D35] p-8 rounded-2xl shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/40 text-red-500 flex items-center justify-center mx-auto text-xl font-mono font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-white">Something went wrong</h2>
            <p className="text-xs text-zinc-400 leading-relaxed font-mono">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-[#DC2626] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
            >
              Reset App Data & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function PublicWebsiteContent({ onSwitchToApp }: { onSwitchToApp: (mode: 'workspace' | 'participant') => void }) {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [isConceptModalOpen, setIsConceptModalOpen] = useState<boolean>(false);
  const [cmsData, setCmsData] = useState<any>(null);
  const [resultsFilter, setResultsFilter] = useState<{ category: Category; eventName: string }>({
    category: 'All',
    eventName: 'All'
  });

  const [pageView, setPageView] = useState<'home' | 'results' | 'team-points' | 'posters' | 'gallery'>(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('gallery')) return 'gallery';
    if (path.includes('posters')) return 'posters';
    if (path.includes('team-points') || path.includes('standings')) return 'team-points';
    if (path.includes('results')) return 'results';
    return 'home';
  });

  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginInitialTab,
    activeModalView,
    setActiveModalView
  } = useFestival();

  React.useEffect(() => {
    const applyCMSData = (data: any) => {
      setCmsData(data);
      const theme = data?.cmsSettings?.colorTheme;
      if (theme) {
        // Set root CSS custom properties for CMS color theme
        const root = document.documentElement;
        if (theme.primaryAccent) root.style.setProperty('--color-primary-accent', theme.primaryAccent);
        if (theme.bodyBg) root.style.setProperty('--color-body-bg', theme.bodyBg);
        if (theme.cardBg) root.style.setProperty('--color-card-bg', theme.cardBg);
        if (theme.cardElevatedBg) root.style.setProperty('--color-card-elevated-bg', theme.cardElevatedBg);
        if (theme.borderSubtle) root.style.setProperty('--color-border-subtle', theme.borderSubtle);
        if (theme.textPrimary) root.style.setProperty('--color-text-primary', theme.textPrimary);
        if (theme.textSecondary) root.style.setProperty('--color-text-secondary', theme.textSecondary);
        if (theme.textMuted) root.style.setProperty('--color-text-muted', theme.textMuted);
        if (theme.goldAccent) root.style.setProperty('--color-gold-accent', theme.goldAccent);
        if (theme.successAccent) root.style.setProperty('--color-success-accent', theme.successAccent);
      }
    };

    const fetchCMSData = () => {
      fetch(`/api/public/cms?t=${Date.now()}`)
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(applyCMSData)
        .catch(err => console.error('Failed to load CMS data:', err));
    };

    fetchCMSData();
    const interval = setInterval(fetchCMSData, 2500);
    return () => clearInterval(interval);
  }, []);

  // Push history state whenever a modal opens so back gestures close the modal & return home
  React.useEffect(() => {
    if (activeModalView !== 'none' || isLoginModalOpen) {
      window.history.pushState({ modalOpen: true }, '', window.location.href);
    }
  }, [activeModalView, isLoginModalOpen]);

  // Listen for browser back button & mobile swipe back gestures to return to home section
  React.useEffect(() => {
    const handlePopState = () => {
      let closedModal = false;
      if (activeModalView !== 'none') {
        setActiveModalView('none');
        closedModal = true;
      }
      if (isLoginModalOpen) {
        setIsLoginModalOpen(false);
        closedModal = true;
      }

      const path = window.location.pathname.toLowerCase();
      if (path.includes('gallery')) {
        setPageView('gallery');
      } else if (path.includes('posters')) {
        setPageView('posters');
      } else if (path.includes('team-points') || path.includes('standings')) {
        setPageView('team-points');
      } else if (path.includes('results')) {
        setPageView('results');
      } else {
        setPageView('home');
        setActiveSection('hero');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeModalView, setActiveModalView, isLoginModalOpen, setIsLoginModalOpen]);

  const handleNavigate = (sectionId: string, filter?: { category?: Category; eventName?: string }) => {
    if (filter) {
      setResultsFilter({
        category: filter.category || 'All',
        eventName: filter.eventName || 'All'
      });
    }

    if (sectionId === 'gallery' || sectionId === 'full-gallery') {
      setPageView('gallery');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.pathname !== '/gallery') {
        window.history.pushState({}, '', '/gallery');
      }
      return;
    }
    if (sectionId === 'posters') {
      setPageView('posters');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.pathname !== '/posters') {
        window.history.pushState({}, '', '/posters');
      }
      return;
    }
    if (sectionId === 'results') {
      setPageView('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.pathname !== '/results') {
        window.history.pushState({}, '', '/results');
      }
      return;
    }
    if (sectionId === 'team-points' || sectionId === 'standings') {
      setPageView('team-points');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.pathname !== '/team-points') {
        window.history.pushState({}, '', '/team-points');
      }
      return;
    }

    setPageView('home');
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    setActiveSection(sectionId);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white selection:bg-emerald-500 font-sans antialiased overflow-x-hidden relative">
      <Header activeSection={pageView === 'home' ? activeSection : pageView} onNavigate={handleNavigate} cmsSettings={cmsData?.cmsSettings} dragBlocks={cmsData?.dragBlocks} />

      <main>
        {pageView === 'gallery' ? (
          <PublicGalleryPage />
        ) : pageView === 'posters' ? (
          <PublicPostersPage />
        ) : pageView === 'results' ? (
          <PublishedResultsPage
            initialCategory={resultsFilter.category}
            initialEvent={resultsFilter.eventName}
            onClearFilter={() => setResultsFilter({ category: 'All', eventName: 'All' })}
          />
        ) : pageView === 'team-points' ? (
          <TeamPointsPage />
        ) : (
          <>
            {cmsData?.dragBlocks && cmsData.dragBlocks.length > 0 ? (
              cmsData.dragBlocks
                .filter((b: any) => b.enabled)
                .sort((a: any, b: any) => a.order - b.order)
                .map((block: any) => {
                  switch (block.type) {
                    case 'hero':
                      return <HeroSection key="hero" onNavigate={handleNavigate} cmsSettings={cmsData.cmsSettings} heroMedia={cmsData.heroMedia} dragBlocks={cmsData.dragBlocks} />;
                    case 'about':
                      return <AboutSection key="about" onOpenConceptModal={() => setIsConceptModalOpen(true)} cmsSettings={cmsData.cmsSettings} />;
                    case 'results':
                      return <ResultsSection key="results" onNavigate={handleNavigate} />;
                    case 'smile':
                    case 'photohub':
                      return <SmilePhotoPortal key="smile" cmsSettings={cmsData?.cmsSettings} />;
                    case 'gallery':
                      return <GallerySection key="gallery" onNavigate={handleNavigate} />;
                    case 'live_stream':
                    case 'live_stages':
                      return <LiveStreamSection key="live_stream" />;
                    case 'highlights':
                      return <VideoHighlights key="highlights" />;
                    default:
                      return null;
                  }
                })
            ) : (
              <>
                <HeroSection onNavigate={handleNavigate} cmsSettings={cmsData?.cmsSettings} heroMedia={cmsData?.heroMedia} dragBlocks={cmsData?.dragBlocks} />
                <AboutSection onOpenConceptModal={() => setIsConceptModalOpen(true)} cmsSettings={cmsData?.cmsSettings} />
                <ResultsSection onNavigate={handleNavigate} />
                <SmilePhotoPortal cmsSettings={cmsData?.cmsSettings} />
              </>
            )}
          </>
        )}
      </main>

      <Footer onNavigate={handleNavigate} cmsSettings={cmsData?.cmsSettings} dragBlocks={cmsData?.dragBlocks} />

      <FullConceptModal
        isOpen={isConceptModalOpen}
        onClose={() => setIsConceptModalOpen(false)}
        cmsSettings={cmsData?.cmsSettings}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        initialTab={loginInitialTab}
      />

      <ParticipantProfileModal
        isOpen={activeModalView === 'participant-profile'}
        onClose={() => setActiveModalView('none')}
      />

      <FaceScannerModal
        isOpen={activeModalView === 'face-scanner'}
        onClose={() => setActiveModalView('none')}
      />
    </div>
  );
}

export default function App() {
  const [appMode, setAppModeState] = useState<'participant' | 'public'>(() => {
    const path = window.location.pathname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const portalParam = (searchParams.get('portal') || searchParams.get('mode'))?.toLowerCase();
    const port = window.location.port;

    if (portalParam === 'participant' || path.startsWith('/participant') || port === '3002') {
      return 'participant';
    }

    return 'public';
  });

  const setAppMode = (mode: 'participant' | 'public') => {
    setAppModeState(mode);
    const newPath = mode === 'participant' ? '/participant' : '/';
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
  };

  return (
    <ErrorBoundary>
      <FestivalProvider>
        <PublicWebsiteContent onSwitchToApp={(mode) => setAppMode(mode as any)} />
      </FestivalProvider>
    </ErrorBoundary>
  );
}
