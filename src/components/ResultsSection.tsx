import React, { useState } from 'react';
import { useFestival } from '../context/FestivalContext';
import { Category } from '../types';
import { ArrowRight, ChevronDown } from 'lucide-react';

interface ResultsSectionProps {
  onNavigate: (sectionId: string, filter?: { category?: Category; eventName?: string }) => void;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({ onNavigate }) => {
  const { houseScores = [], results = [], categories = [], standingsMeta } = useFestival();
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedEvent, setSelectedEvent] = useState<string>('All');

  const handleCategoryChange = (cat: Category) => {
    setSelectedCategory(cat);
    setSelectedEvent('All');
  };

  // Filter available competition names dynamically by selectedCategory
  const filteredResultsForCategory = (results || []).filter((r) => {
    if (selectedCategory === 'All') return true;
    return r.category === selectedCategory;
  });

  const availableEvents = Array.from(new Set(filteredResultsForCategory.map((r) => r.eventName))).sort();

  // Calculate max score for relative progress bar calculation
  const maxScore = (houseScores || []).length > 0 ? Math.max(...(houseScores || []).map(h => h.totalPoints)) : 1000;

  const handleGetResult = () => {
    onNavigate('results', { category: selectedCategory, eventName: selectedEvent });
  };

  return (
    <section id="results" className="py-10 sm:py-14 bg-[#0D0D0D] relative overflow-hidden border-b border-white/10 font-sans">
      {/* Background Accent Lighting removed to match theme */}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span style={{ color: 'var(--color-primary-accent)' }} className="font-mono text-[10px] font-bold tracking-[0.25em] uppercase">
                STANDINGS & RESULTS
              </span>
              {Boolean(standingsMeta?.isSnapshot && standingsMeta?.resultsCount && standingsMeta.resultsCount > 0) && (
                <span 
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border"
                  style={{ 
                    borderColor: 'var(--color-primary-accent)', 
                    color: 'var(--color-primary-accent)',
                    backgroundColor: 'rgba(239, 6, 106, 0.08)'
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-primary-accent)' }} />
                  After {standingsMeta.resultsCount} published
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Who's leading
            </h2>
            <p className="text-zinc-300 text-xs font-sans mt-0.5">
              The top house teams so far — and a shortcut to any published result.
            </p>
          </div>

          <button
            onClick={() => onNavigate('team-points')}
            style={{ color: 'var(--color-primary-accent)' }}
            className="font-bold text-xs font-mono tracking-wider hover:underline flex items-center gap-1.5 shrink-0 self-start sm:self-end uppercase cursor-pointer"
          >
            <span>FULL STANDINGS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2-Column Split: Rankings List on Left, Find A Result Box on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: House Standings List */}
          <div className="lg:col-span-7 space-y-4 pt-1">
            <div className="space-y-4">
              {houseScores.length > 0 ? (
                houseScores.slice(0, 3).map((house, index) => {
                  const percentage = maxScore > 0 ? Math.min(100, Math.round((house.totalPoints / maxScore) * 100)) : 80;
                  return (
                    <div key={house.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span style={{ color: 'var(--color-primary-accent)' }} className="text-lg font-black font-mono w-4">
                            {index + 1}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono">
                            {house.name}
                          </span>
                        </div>
                        <span className="text-base sm:text-lg font-black font-mono text-white tracking-wider">
                          {house.totalPoints}
                        </span>
                      </div>

                      {/* Red progress bar */}
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${percentage}%`, backgroundColor: 'var(--color-primary-accent)' }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center p-8 border border-white/5 bg-white/5 rounded-xl">
                  <span className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Team standings not yet published</span>
                </div>
              )}
            </div>

            <div className="pt-1">
              <button
                onClick={() => onNavigate('team-points')}
                style={{ color: 'var(--color-primary-accent)' }}
                className="font-bold text-xs font-mono tracking-wider hover:underline flex items-center gap-1.5 uppercase cursor-pointer"
              >
                <span>SEE ALL HOUSES</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Find a Result Form Box */}
          <div className="lg:col-span-5 bg-[#18181A] border border-white/10 rounded-xl p-5 sm:p-6 shadow-xl space-y-3 relative">
            {results && results.length > 0 ? (
              <>
                <div>
                  <span style={{ color: 'var(--color-primary-accent)' }} className="text-[10px] font-bold font-mono uppercase tracking-widest block mb-0.5">
                    FIND A RESULT
                  </span>
                  <p className="text-zinc-300 text-xs leading-relaxed font-sans">
                    Pick a category and competition to jump straight to its result.
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  {/* Category Select Dropdown */}
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value as Category)}
                      className="w-full bg-[#121212] border border-white/10 focus:border-[#DC2626] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono appearance-none focus:outline-none transition-colors pr-10 cursor-pointer"
                    >
                      <option value="All">All categories</option>
                      {categories.map((c: any) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Competition Select Dropdown */}
                  <div className="relative">
                    <select
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value)}
                      className="w-full bg-[#121212] border border-white/10 focus:border-[#DC2626] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono appearance-none focus:outline-none transition-colors pr-10 cursor-pointer"
                    >
                      <option value="All">All competitions</option>
                      {availableEvents.map((evt) => (
                        <option key={evt} value={evt}>
                          {evt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Red GET RESULT CTA Button */}
                  <button
                    type="button"
                    onClick={handleGetResult}
                    style={{ backgroundColor: 'var(--color-primary-accent)' }}
                    className="w-full py-3 hover:opacity-90 active:scale-[0.99] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>GET RESULT</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full min-h-[180px] p-4">
                <span className="text-zinc-500 font-mono text-sm uppercase tracking-widest block mb-2">
                  Result is not published
                </span>
                <p className="text-zinc-600 text-xs font-sans">
                  Results will appear here once competitions are completed.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
