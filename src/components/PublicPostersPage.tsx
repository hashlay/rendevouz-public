import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFestival } from '../context/FestivalContext';
import { Category, ResultItem } from '../types';
import { Search, ChevronDown, Download, X, Share2, ZoomIn, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';
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

const dataUrlToJpgFile = async (dataUrl: string, fileName: string): Promise<File> => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: 'image/jpeg' });
};

export const PublicPostersPage: React.FC = () => {
  const { results = [], categories = [], eventSettings } = useFestival();
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePoster, setActivePoster] = useState<CompetitionPoster | null>(null);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  // Group verified published results by Competition (competitionId or eventName + category)
  // Sort so latest announced is at the top
  const competitionPosters = useMemo(() => {
    const competitionMap = new Map<string, { results: ResultItem[]; latestUpdatedAt: string }>();

    // Filter to valid published ranks (Rank 1, 2, 3) - EXACTLY matching PublishedResultsPage logic
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

    // Sort ascending by updatedAt to assign announcement numbers (1 = first announced)
    const sortedEntries = Array.from(competitionMap.entries()).sort((a, b) =>
      a[1].latestUpdatedAt.localeCompare(b[1].latestUpdatedAt)
    );

    // Create posters with announcement numbers
    const posters: CompetitionPoster[] = sortedEntries.map(([key, data], index) => {
      const first = data.results[0];
      return {
        id: `comp-post-${index}`,
        eventName: first.eventName,
        category: first.category as Category,
        compIndex: index + 1, // Announcement number (1 = first announced)
        results: data.results,
        imageUrl: ''
      };
    });

    // Reverse so latest announced appears first on the page
    return posters.reverse();
  }, [results]);

  const filteredPosters = useMemo(() => {
    return competitionPosters.filter((poster) => {
      const matchesCategory = selectedCategory === 'All' || poster.category === selectedCategory;
      const matchesQuery =
        searchQuery === '' ||
        poster.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poster.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesQuery;
    });
  }, [competitionPosters, selectedCategory, searchQuery]);

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
      console.error('Download poster failed', err);
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

  const handlePrev = () => {
    if (!activePoster) return;
    const currentIndex = filteredPosters.findIndex((p) => p.id === activePoster.id);
    const prevIndex = (currentIndex - 1 + filteredPosters.length) % filteredPosters.length;
    setActivePoster(filteredPosters[prevIndex]);
    setShowShareMenu(false);
  };

  const handleNext = () => {
    if (!activePoster) return;
    const currentIndex = filteredPosters.findIndex((p) => p.id === activePoster.id);
    const nextIndex = (currentIndex + 1) % filteredPosters.length;
    setActivePoster(filteredPosters[nextIndex]);
    setShowShareMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white pt-24 pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header section - Matching screenshot 1 & 3 older version */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Competition Posters
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm font-sans mt-1">
              Verified official result posters generated per competition event.
            </p>
          </div>

          <div className="bg-[#141417] border border-[#26262B] rounded-lg px-3.5 py-1.5 flex items-center gap-2 self-start sm:self-auto shadow-sm">
            <span className="text-[#EF4444] font-bold text-sm font-mono">{filteredPosters.length}</span>
            <span className="text-zinc-400 text-xs font-mono">Posters Generated</span>
          </div>
        </div>

        {/* Filter bar - Matching screenshot 1 & 3 older version */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search event ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121215] border border-[#232328] focus:border-zinc-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="relative min-w-[200px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category)}
              className="w-full bg-[#121215] border border-[#232328] focus:border-zinc-500 rounded-xl px-4 py-2.5 text-xs text-white font-sans appearance-none focus:outline-none transition-colors pr-10 cursor-pointer"
            >
              <option value="All">All categories</option>
              {categories.map((c) => (
                <option key={c.id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Posters Grid - Matching screenshot 1 & 3 older version */}
        {(loading || results.length === 0) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col">
                <div className="aspect-[4/5] bg-[#141417] border border-[#26262B] rounded-2xl flex items-center justify-center p-4">
                  <span className="text-zinc-600 font-mono text-xs tracking-wider animate-pulse">Generating...</span>
                </div>
                <div className="mt-3 text-center">
                  <div className="h-4 bg-zinc-800 rounded w-3/4 mx-auto mb-1 animate-pulse" />
                  <div className="h-3 bg-zinc-900 rounded w-1/2 mx-auto animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPosters.map((poster) => (
              <div
                key={poster.id}
                onClick={() => {
                  setActivePoster(poster);
                  setShowShareMenu(false);
                }}
                className="group cursor-pointer flex flex-col"
              >
                {/* Poster Canvas Card Container */}
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
        ) : (
          <div className="text-center py-20 border border-dashed border-[#232328] rounded-2xl">
            <p className="text-zinc-500 font-mono text-sm">No posters found matching your criteria.</p>
          </div>
        )}

      </div>

      {/* Lightbox Modal rendered directly on document.body via Portal - Matching Screenshot 2 Older Version */}
      {activePoster && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => {
            setActivePoster(null);
            setShowShareMenu(false);
          }}
        >
          {/* Top-Right Floating Close Button - Matching screenshot 2 */}
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

          {/* Floating Left Navigation Arrow - Matching screenshot 2 */}
          {filteredPosters.length > 1 && (
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

          {/* Main Poster Image Display in Center - Matching screenshot 2 */}
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

          {/* Floating Right Navigation Arrow - Matching screenshot 2 */}
          {filteredPosters.length > 1 && (
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

          {/* Floating Bottom Info & Control Bar - Matching screenshot 2 */}
          <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-xl w-[90vw] bg-[#18181B]/95 border border-white/10 backdrop-blur-md rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-2xl gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0 flex-1">
              <h4 className="text-sm sm:text-base font-bold text-white tracking-tight line-clamp-1">
                {activePoster.eventName}
              </h4>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                {activePoster.category} Category
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
                className="px-4 py-2 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-xl text-xs font-mono font-bold transition-colors flex items-center gap-2 shadow-lg cursor-pointer"
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

    </div>
  );
};
