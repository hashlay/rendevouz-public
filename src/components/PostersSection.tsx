import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFestival } from '../context/FestivalContext';
import { Category, ResultItem } from '../types';
import { ZoomIn, ArrowRight, X, ChevronLeft, ChevronRight, Download, Share2, Check, Copy } from 'lucide-react';
import { PosterImage } from './PosterImage';
import { generatePosterShareCaption, renderPosterToBlob } from '../utils/posterRenderer';

interface CompetitionPoster {
  id: string;
  eventName: string;
  category: Category;
  compIndex: number;
  results: ResultItem[];
  imageUrl: string;
}

interface PostersSectionProps {
  onNavigate?: (sectionId: string) => void;
}

const dataUrlToJpgFile = async (dataUrl: string, fileName: string): Promise<File> => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: 'image/jpeg' });
};

export const PostersSection: React.FC<PostersSectionProps> = ({ onNavigate }) => {
  const { results = [], eventSettings } = useFestival();
  const [activePoster, setActivePoster] = useState<CompetitionPoster | null>(null);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Group verified published results by Competition (competitionId or eventName + category)
  // Sort ascending by announcement time to assign compIndex (#1, #2...)
  // Then reverse so the latest announced appears first
  const competitionPosters = useMemo(() => {
    const competitionMap = new Map<string, { results: ResultItem[]; latestUpdatedAt: string }>();

    // Filter to valid published ranks (Rank 1, 2, 3)
    const validResults = (results || []).filter(r => r.rank !== undefined && r.rank > 0 && r.rank <= 3);

    // Group items by competition
    validResults.forEach((res) => {
      const key = res.competitionId || `${res.eventName}__${res.category}`;
      const updatedAt = res.raw?.updatedAt || res.raw?.createdAt || '';
      if (!competitionMap.has(key)) {
        competitionMap.set(key, { results: [], latestUpdatedAt: updatedAt });
      }
      const group = competitionMap.get(key)!;
      group.results.push(res);
      if (updatedAt > group.latestUpdatedAt) {
        group.latestUpdatedAt = updatedAt;
      }
    });

    // Sort ascending by updatedAt to assign sequential announcement numbers (1 = first announced)
    const sortedEntries = Array.from(competitionMap.entries()).sort((a, b) =>
      a[1].latestUpdatedAt.localeCompare(b[1].latestUpdatedAt)
    );

    // Create posters with announcement numbers
    const posters: CompetitionPoster[] = sortedEntries.map(([key, data], index) => {
      const first = data.results[0];
      return {
        id: `posters-sec-${index}`,
        eventName: first.eventName,
        category: first.category as Category,
        compIndex: index + 1,
        results: data.results,
        imageUrl: ''
      };
    });

    // Reverse so the newest/latest announced result posters are at the start
    return posters.reverse();
  }, [results]);

  // Strictly display only the latest 8 announced posters on the homepage
  // As new posters arrive (e.g. 9th), the oldest ones automatically drop off
  const displayPosters = useMemo(() => {
    return competitionPosters.slice(0, 8);
  }, [competitionPosters]);

  useEffect(() => {
    if (activePoster) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activePoster]);

  const handleNext = () => {
    if (!activePoster || displayPosters.length <= 1) return;
    const currentIndex = displayPosters.findIndex(p => p.id === activePoster.id);
    const nextIndex = (currentIndex + 1) % displayPosters.length;
    setActivePoster(displayPosters[nextIndex]);
    setCopied(false);
    setShowShareMenu(false);
  };

  const handlePrev = () => {
    if (!activePoster || displayPosters.length <= 1) return;
    const currentIndex = displayPosters.findIndex(p => p.id === activePoster.id);
    const prevIndex = (currentIndex - 1 + displayPosters.length) % displayPosters.length;
    setActivePoster(displayPosters[prevIndex]);
    setCopied(false);
    setShowShareMenu(false);
  };

  const handleDownload = async (poster: CompetitionPoster) => {
    try {
      const cleanCat = poster.category.replace(/[^\w\s-]/gi, '').trim().replace(/\s+/g, '_');
      const cleanEvent = poster.eventName.replace(/[^\w\s-]/gi, '').trim().replace(/\s+/g, '_');
      const fileName = `Result_Poster_${cleanCat}_${cleanEvent}.jpg`;

      if (poster.imageUrl && poster.imageUrl.startsWith('data:image/')) {
        const a = document.createElement('a');
        a.href = poster.imageUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const { blob } = await renderPosterToBlob(
          poster.results,
          eventSettings,
          poster.eventName,
          poster.category,
          poster.compIndex
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (err) {
      console.error('Failed to download poster:', err);
    }
  };

  const handleShare = async (poster: CompetitionPoster) => {
    const caption = generatePosterShareCaption(
      poster.eventName,
      poster.category,
      poster.compIndex,
      poster.results,
      eventSettings
    );
    const cleanCat = poster.category.replace(/[^\w\s-]/gi, '').trim().replace(/\s+/g, '_');
    const cleanEvent = poster.eventName.replace(/[^\w\s-]/gi, '').trim().replace(/\s+/g, '_');
    const fileName = `Result_Poster_${cleanCat}_${cleanEvent}.jpg`;

    try {
      let file: File | null = null;
      if (poster.imageUrl && poster.imageUrl.startsWith('data:image/')) {
        file = await dataUrlToJpgFile(poster.imageUrl, fileName);
      } else {
        const { blob } = await renderPosterToBlob(
          poster.results,
          eventSettings,
          poster.eventName,
          poster.category,
          poster.compIndex
        );
        file = new File([blob], fileName, { type: 'image/jpeg' });
      }

      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `🏆 ${poster.eventName} (${poster.category}) Result`,
          text: caption,
          files: [file]
        });
        return;
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.warn('Native image file share failed, falling back:', err);
    }

    // Fallback for browsers/desktops without native file share:
    // 1. Download JPEG image immediately
    handleDownload(poster);
    // 2. Copy formatted caption to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
    // 3. Open share menu popup for direct WhatsApp Web share
    setShowShareMenu(true);
  };

  const handleCopyLink = (poster: CompetitionPoster) => {
    const caption = generatePosterShareCaption(
      poster.eventName,
      poster.category,
      poster.compIndex,
      poster.results,
      eventSettings
    );
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="posters" className="py-10 sm:py-14 bg-[#0A0A0C] relative overflow-hidden border-b border-white/10 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header matching GallerySection design */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 border-b border-white/10 pb-5 gap-4">
          <div>
            <span style={{ color: 'var(--color-primary-accent)' }} className="font-mono text-[10px] font-bold tracking-[0.25em] uppercase mb-0.5 block">
              MOMENTS & RESULTS
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Festival Posters
            </h2>
            <p className="text-zinc-400 text-xs font-sans mt-0.5">
              Official published results and latest announced winner posters.
            </p>
          </div>

          <button
            onClick={() => onNavigate && onNavigate('posters')}
            style={{ color: 'var(--color-primary-accent)' }}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider hover:opacity-80 transition-opacity cursor-pointer self-start sm:self-auto"
          >
            <span>View All Posters ({competitionPosters.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Posters Grid - Exactly matching PublicPostersPage card display */}
        {displayPosters.length === 0 ? (
          <div className="text-center py-16 bg-[#161619]/50 rounded-2xl border border-white/5">
            <p className="text-zinc-400 font-medium">No result posters announced yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {displayPosters.map((poster) => (
              <div
                key={poster.id}
                onClick={() => {
                  setActivePoster(poster);
                  setCopied(false);
                  setShowShareMenu(false);
                }}
                className="group cursor-pointer flex flex-col"
              >
                {/* Poster Canvas Card Container - Exact match with PublicPostersPage */}
                <div className="relative aspect-[4/5] bg-[#121215] border border-[#232328] rounded-2xl overflow-hidden shadow-lg group-hover:border-zinc-500 transition-all duration-300 flex items-center justify-center">
                  <PosterImage
                    competitionId={poster.id}
                    eventName={poster.eventName}
                    category={poster.category}
                    compIndex={poster.compIndex}
                    results={poster.results}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                    onLoadUrl={(url) => { poster.imageUrl = url; }}
                  />

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                  {/* Announcement Number Badge */}
                  <div className="absolute top-2.5 left-2.5 bg-black/80 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold text-amber-400 uppercase border border-amber-500/30 shadow-md">
                    #{poster.compIndex}
                  </div>

                  {/* Zoom Action on Hover */}
                  <div
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    style={{ backgroundColor: 'var(--color-primary-accent)' }}
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                {/* Event Name & Category below card */}
                <div className="mt-3 text-center">
                  <h3 className="text-sm font-bold text-white tracking-tight line-clamp-1 group-hover:text-red-400 transition-colors">
                    {poster.eventName}
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5 uppercase tracking-wider">
                    {poster.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button for Mobile and Desktop at Bottom */}
        {competitionPosters.length > 0 && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => onNavigate && onNavigate('posters')}
              style={{ backgroundColor: 'var(--color-primary-accent)' }}
              className="px-6 py-2.5 hover:opacity-90 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all duration-200 inline-flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <span>VIEW ALL POSTERS ({competitionPosters.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal via Portal */}
      {activePoster && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => {
            setActivePoster(null);
            setShowShareMenu(false);
          }}
        >
          {/* Top-Right Floating Close Button */}
          <button
            onClick={() => {
              setActivePoster(null);
              setShowShareMenu(false);
            }}
            className="fixed top-5 right-5 sm:top-8 sm:right-8 z-50 p-2.5 text-zinc-300 hover:text-white bg-[#1C1C1F]/90 hover:bg-[#27272A] border border-white/10 rounded-full transition-all cursor-pointer shadow-2xl"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Floating Left Navigation Arrow */}
          {displayPosters.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="fixed left-4 sm:left-8 top-1/2 -translate-y-1/2 z-50 p-3 text-zinc-300 hover:text-white bg-[#1C1C1F]/90 hover:bg-[#27272A] border border-white/10 rounded-full transition-all cursor-pointer shadow-2xl"
              title="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Main Poster Image Display in Center */}
          <div
            className="relative max-h-[75vh] max-w-[90vw] sm:max-w-xl flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <PosterImage
              competitionId={activePoster.id}
              eventName={activePoster.eventName}
              category={activePoster.category}
              compIndex={activePoster.compIndex}
              results={activePoster.results}
              className="max-h-[72vh] w-auto object-contain rounded-2xl shadow-2xl"
              onLoadUrl={(url) => { activePoster.imageUrl = url; }}
            />
          </div>

          {/* Floating Right Navigation Arrow */}
          {displayPosters.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 p-3 text-zinc-300 hover:text-white bg-[#1C1C1F]/90 hover:bg-[#27272A] border border-white/10 rounded-full transition-all cursor-pointer shadow-2xl"
              title="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Floating Bottom Info & Control Bar */}
          <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-xl w-[90vw] bg-[#18181B]/95 border border-white/10 backdrop-blur-md rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-2xl gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0 flex-1">
              <h4 className="text-sm sm:text-base font-bold text-white tracking-tight line-clamp-1">
                {activePoster.eventName}
              </h4>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                {activePoster.category} Category • #{activePoster.compIndex}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 relative">
              <button
                onClick={() => handleShare(activePoster)}
                className="px-4 py-2 bg-[#27272A] hover:bg-[#3F3F46] border border-white/10 text-white rounded-xl text-xs font-mono font-bold transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              <button
                onClick={() => handleDownload(activePoster)}
                style={{ backgroundColor: 'var(--color-primary-accent)' }}
                className="px-4 py-2 hover:opacity-90 text-white rounded-xl text-xs font-mono font-bold transition-colors flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download HD</span>
              </button>

              {/* Share Menu Popup */}
              {showShareMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-56 bg-[#1C1C21] border border-[#33333D] rounded-xl p-2 shadow-2xl z-50">
                  <button
                    onClick={() => handleCopyLink(activePoster)}
                    className="w-full text-left px-3 py-2 text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Caption Copied!' : 'Copy Result Caption'}
                  </button>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(generatePosterShareCaption(activePoster.eventName, activePoster.category, activePoster.compIndex, activePoster.results, eventSettings))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-left px-3 py-2 text-xs font-mono text-zinc-300 hover:text-white hover:bg-[#25D366]/20 rounded-lg transition-colors flex items-center gap-2 mt-1"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#25D366]" />
                    Share on WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};
