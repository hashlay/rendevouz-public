import React, { useState, useMemo, useEffect } from 'react';
import { useFestival } from '../context/FestivalContext';
import { Category, ResultItem } from '../types';
import { Search, ChevronDown, ChevronUp, AlertCircle, ArrowLeft, Trophy, Download, Share2, Copy, Check } from 'lucide-react';
import { renderPosterToCanvas, generatePosterShareCaption, renderPosterToBlob } from '../utils/posterRenderer';

interface PublishedResultsPageProps {
  initialCategory?: Category;
  initialEvent?: string;
  onClearFilter?: () => void;
}

export const PublishedResultsPage: React.FC<PublishedResultsPageProps> = ({
  initialCategory = 'All',
  initialEvent = 'All',
  onClearFilter
}) => {
  const { results = [], categories = [], eventSettings } = useFestival();
  const [selectedCategory, setSelectedCategory] = useState<Category>(initialCategory);
  const [selectedEvent, setSelectedEvent] = useState<string>(initialEvent);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(initialEvent !== 'All' ? initialEvent : null);
  const [activeShareGroup, setActiveShareGroup] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCategory(initialCategory);
    setSelectedEvent(initialEvent);
    if (initialEvent !== 'All') {
      setExpandedEvent(initialEvent);
    }
  }, [initialCategory, initialEvent]);

  const handleDownloadPoster = async (group: { eventName: string; category: string; key: string; items: ResultItem[]; announcementNumber?: number }) => {
    try {
      const canvas = document.createElement('canvas');
      const compIdx = group.announcementNumber || 1;
      await renderPosterToCanvas(
        canvas,
        group.items,
        eventSettings,
        group.eventName,
        group.category,
        compIdx
      );
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const fileName = `Result_Poster_${group.category}_${group.eventName.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download HD poster", err);
    }
  };

  const handleSharePoster = async (group: { eventName: string; category: string; key: string; items: ResultItem[]; announcementNumber?: number }) => {
    const compIdx = group.announcementNumber || 1;
    const caption = generatePosterShareCaption(
      group.eventName,
      group.category,
      compIdx,
      group.items,
      eventSettings
    );
    const cleanCat = group.category.replace(/[^\w\s-]/gi, '').trim().replace(/\s+/g, '_');
    const cleanEvent = group.eventName.replace(/[^\w\s-]/gi, '').trim().replace(/\s+/g, '_');
    const fileName = `Result_Poster_${cleanCat}_${cleanEvent}.jpg`;

    try {
      const { blob } = await renderPosterToBlob(
        group.items,
        eventSettings,
        group.eventName,
        group.category,
        compIdx
      );
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `🏆 ${group.eventName} (${group.category}) Result`,
          text: caption,
          files: [file]
        });
        return;
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.warn('Native image file share failed:', err);
    }

    // Fallback: Download JPG & copy caption & open popup
    handleDownloadPoster(group);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(caption);
      setCopiedKey(group.key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
    setActiveShareGroup(activeShareGroup === group.key ? null : group.key);
  };

  const handleCopyLink = (group: { eventName: string; category: string; key: string; items: ResultItem[]; announcementNumber?: number }) => {
    const compIdx = group.announcementNumber || 1;
    const caption = generatePosterShareCaption(
      group.eventName,
      group.category,
      compIdx,
      group.items,
      eventSettings
    );
    if (navigator.clipboard) {
      navigator.clipboard.writeText(caption);
      setCopiedKey(group.key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Group all results by unique competition (competitionId or eventName + category)
  // Sort by announcement time: latest updatedAt at TOP of page
  const groupedEvents = useMemo(() => {
    const map = new Map<string, { key: string; eventName: string; category: string; competitionId?: string; items: ResultItem[]; latestUpdatedAt: string }>();
    
    // Filter to valid published ranks (Rank 1, 2, 3)
    const validResults = (results || []).filter(r => r.rank !== undefined && r.rank > 0 && r.rank <= 3);
    
    validResults.forEach((res) => {
      const key = res.competitionId || `${res.eventName}__${res.category}`;
      const updatedAt = res.raw?.updatedAt || res.raw?.createdAt || '';
      if (!map.has(key)) {
        map.set(key, {
          key,
          eventName: res.eventName,
          category: res.category,
          competitionId: res.competitionId,
          items: [],
          latestUpdatedAt: updatedAt
        });
      }
      const group = map.get(key)!;
      group.items.push(res);
      // Track the latest updatedAt for this competition
      if (updatedAt > group.latestUpdatedAt) {
        group.latestUpdatedAt = updatedAt;
      }
    });
    
    // Sort ascending by updatedAt first to assign announcement numbers (1 = first announced)
    const sorted = Array.from(map.values()).sort((a, b) => 
      a.latestUpdatedAt.localeCompare(b.latestUpdatedAt)
    );
    
    // Assign announcement numbers (1 = earliest, N = latest)
    sorted.forEach((group, idx) => {
      (group as any).announcementNumber = idx + 1;
    });
    
    // Reverse so latest announced appears at the top of the page
    return sorted.reverse();
  }, [results]);

  // Filtered grouped events
  const filteredEvents = useMemo(() => {
    return groupedEvents.filter((group) => {
      const matchesCategory = selectedCategory === 'All' || group.category === selectedCategory;
      const matchesEvent = selectedEvent === 'All' || group.eventName.toLowerCase() === selectedEvent.toLowerCase();
      const matchesQuery =
        searchQuery === '' ||
        group.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.items.some(
          (i) =>
            i.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.codeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.department.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesCategory && matchesEvent && matchesQuery;
    });
  }, [groupedEvents, selectedCategory, selectedEvent, searchQuery]);

  const toggleEvent = (eventName: string) => {
    setExpandedEvent(expandedEvent === eventName ? null : eventName);
  };

  const hasSpecificEventSelected = selectedEvent !== 'All';
  const isSelectedEventPublished = hasSpecificEventSelected && filteredEvents.length > 0;

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white pt-20 sm:pt-24 pb-16 font-sans selection:bg-[#DC2626]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 border-b border-[#2A2A30] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span style={{ color: 'var(--color-primary-accent)' }} className="font-mono text-[10px] font-bold tracking-[0.25em] uppercase mb-1 block">
              PUBLISHED RESULTS
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2 font-sans">
              Results Standings
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl leading-relaxed font-sans">
              Every published result from Festival. Results stream in live as the juries sign them off.
            </p>

            <div style={{ color: 'var(--color-primary-accent)', borderColor: 'var(--color-primary-accent)' }} className="inline-block bg-[#1B1B1F] border px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase mt-3">
              {groupedEvents.length} COMPETITIONS PUBLISHED
            </div>
          </div>

          {hasSpecificEventSelected && (
            <button
              onClick={() => {
                setSelectedEvent('All');
                setSelectedCategory('All');
                if (onClearFilter) onClearFilter();
              }}
              style={{ backgroundColor: 'var(--color-primary-accent)' }}
              className="px-3.5 py-2 hover:opacity-90 text-white text-xs font-mono font-bold uppercase rounded-xl transition-all flex items-center gap-2 self-start sm:self-end cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Show All Competitions</span>
            </button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-6">
          <div className="sm:col-span-8 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search competition or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161619] border border-[#2D2D35] focus:border-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono placeholder:text-zinc-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="sm:col-span-4 relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category)}
              className="w-full bg-[#161619] border border-[#2D2D35] focus:border-white rounded-xl px-3.5 py-2.5 text-xs text-white font-mono appearance-none focus:outline-none transition-colors pr-10 cursor-pointer"
            >
              <option value="All">All categories</option>
              {categories.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {hasSpecificEventSelected && !isSelectedEventPublished && (
          <div style={{ borderColor: 'var(--color-primary-accent)' }} className="bg-[#181214] border rounded-xl p-6 text-center max-w-xl mx-auto shadow-xl space-y-3 my-6">
            <div style={{ backgroundColor: 'var(--color-primary-accent)', color: '#ffffff' }} className="w-10 h-10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-sans">
                Result Not Published Yet
              </h3>
              <p className="text-zinc-300 text-xs font-mono mt-1 leading-relaxed">
                Official results for <span style={{ color: 'var(--color-primary-accent)' }} className="font-bold">"{selectedEvent}"</span> have not been published by the jury yet.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedEvent('All');
                if (onClearFilter) onClearFilter();
              }}
              style={{ backgroundColor: 'var(--color-primary-accent)' }}
              className="px-4 py-2 hover:opacity-90 text-white text-xs font-mono font-bold uppercase rounded-xl shadow transition-all cursor-pointer inline-block mt-2"
            >
              View All Published Results
            </button>
          </div>
        )}

        {/* Results List */}
        <div className="space-y-3">
          {filteredEvents.map((group, index) => {
            const isExpanded = expandedEvent === group.key || hasSpecificEventSelected;
            const itemNumber = (group as any).announcementNumber || (filteredEvents.length - index);

            return (
              <div
                key={group.key}
                className="bg-[#161619] border border-[#2A2A32] rounded-xl overflow-hidden shadow-md transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleEvent(group.key)}
                  className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-[#1C1C21] transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div style={{ color: 'var(--color-primary-accent)', borderColor: 'var(--color-primary-accent)' }} className="w-8 h-8 rounded-lg bg-[#222228] border flex items-center justify-center font-mono font-bold text-xs">
                      {itemNumber}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white font-competition-title tracking-snug">
                        {group.eventName}
                      </h3>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        {group.category} · {group.items[0]?.participationType || (group.eventName.toLowerCase().includes('group') || group.eventName.toLowerCase().includes('team') || group.eventName.toLowerCase().includes('choral') ? 'Group' : 'Individual')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" style={{ color: 'var(--color-primary-accent)' }} />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-zinc-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-2 sm:p-4 bg-[#111114] border-t border-[#25252D] overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-[#2A2A35] text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                          <th className="py-2.5 px-4 w-16 text-center">RANK</th>
                          <th className="py-2.5 px-4">PARTICIPANT</th>
                          <th className="py-2.5 px-4">TEAM</th>
                          <th className="py-2.5 px-4 text-right">GRADE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#202028]">
                        {group.items
                          .sort((a, b) => a.rank - b.rank)
                          .map((res) => {
                            const isFirst = res.rank === 1;
                            return (
                              <tr key={res.id} className="hover:bg-white/5 transition-colors">
                                <td className="py-3 px-4 text-center font-extrabold text-sm">
                                  {isFirst ? (
                                    <span style={{ color: 'var(--color-primary-accent)' }} className="inline-flex items-center justify-center gap-1 font-black">
                                      <Trophy className="w-4 h-4" style={{ color: 'var(--color-primary-accent)' }} /> 1
                                    </span>
                                  ) : (
                                    <span className="text-zinc-300 font-bold">{res.rank}</span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <div
                                    style={isFirst ? { color: 'var(--color-primary-accent)' } : {}}
                                    className={`font-sans text-xs sm:text-sm font-extrabold uppercase tracking-wide ${isFirst ? '' : 'text-white'
                                      }`}
                                  >
                                    {res.participantName}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-zinc-300 font-sans text-xs font-medium">
                                  {res.department}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  {(() => {
                                    const m = res.averageMark ?? (res.raw ? res.raw.averageMark : undefined) ?? res.totalMark ?? res.marks ?? (res.raw ? res.raw.totalMark : 0);
                                    let g = res.grade;
                                    if (m > 0) {
                                      if (m >= 90) g = 'A+';
                                      else if (m >= 80) g = 'A';
                                      else if (m >= 70) g = 'B+';
                                      else if (m >= 60) g = 'B';
                                      else if (m >= 50) g = 'C+';
                                      else if (m >= 40) g = 'C';
                                      else if (m >= 30) g = 'D+';
                                      else g = 'D';
                                    }
                                    return (
                                      <div className="flex flex-col items-end gap-0.5">
                                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded border border-[#3F3F46] bg-[#18181B] text-[11px] font-mono font-bold text-emerald-400 min-w-[28px] shadow-xs">
                                          {g || 'A'}
                                        </span>
                                        {m > 0 && <span className="text-[10px] text-zinc-400 font-mono">{m} marks</span>}
                                      </div>
                                    );
                                  })()}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>

                    <div className="px-4 pb-2 pt-4 bg-[#111114] flex items-center gap-3 border-t border-[#202028] mt-2 relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDownloadPoster(group); }}
                        style={{ color: 'var(--color-primary-accent)', borderColor: 'var(--color-primary-accent)' }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border rounded-md text-xs font-bold font-mono uppercase transition-colors cursor-pointer shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download HD Poster</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleSharePoster(group); }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 rounded-md text-xs font-bold font-mono uppercase transition-colors cursor-pointer shadow-sm"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </button>

                      {/* Share Menu Popup */}
                      {activeShareGroup === group.key && (
                        <div className="absolute bottom-full left-32 mb-2 w-56 bg-[#1C1C21] border border-[#33333D] rounded-xl p-2 shadow-2xl z-50">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCopyLink(group); }}
                            className="w-full text-left px-3 py-2 text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            {copiedKey === group.key ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedKey === group.key ? 'Caption Copied!' : 'Copy Result Caption'}
                          </button>
                          <a
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(generatePosterShareCaption(group.eventName, group.category, group.announcementNumber || 1, group.items, eventSettings))}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full text-left px-3 py-2 text-xs font-mono text-zinc-300 hover:text-white hover:bg-[#25D366]/20 rounded-lg transition-colors flex items-center gap-2 mt-1"
                          >
                            <Share2 className="w-3.5 h-3.5 text-[#25D366]" />
                            Share on WhatsApp
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {!hasSpecificEventSelected && filteredEvents.length === 0 && (
            <div className="text-center py-12 bg-[#161619] border border-[#2A2A32] rounded-xl text-zinc-400 font-mono text-xs">
              No published results match your search query.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
