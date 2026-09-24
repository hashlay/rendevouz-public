import React, { useState, useMemo } from 'react';
import { useFestival } from '../context/FestivalContext';
import { Search } from 'lucide-react';

export const TeamPointsPage: React.FC = () => {
  const { houseScores = [] } = useFestival();
  const [searchQuery, setSearchQuery] = useState('');

  // Sorted house scores
  const sortedHouses = useMemo(() => {
    return [...(houseScores || [])].sort((a, b) => b.totalPoints - a.totalPoints);
  }, [houseScores]);

  const top1 = sortedHouses[0];
  const top2 = sortedHouses[1];
  const top3 = sortedHouses[2];

  // Remaining houses for table view
  const filteredHouses = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    return sortedHouses.filter((h) =>
      q === '' ? true : (h.name || '').toLowerCase().includes(q) || (h.code || '').toLowerCase().includes(q)
    );
  }, [sortedHouses, searchQuery]);

  const maxPoints = sortedHouses.length > 0 ? Math.max(...sortedHouses.map((h) => h.totalPoints)) : 1000;

  return (
    <div className="min-h-screen bg-[#0E0E10] text-white pt-20 sm:pt-24 pb-16 font-sans selection:bg-[#DC2626]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Hero Header */}
        <div className="mb-8 sm:mb-10 text-center sm:text-left">
          <span style={{ color: 'var(--color-primary-accent)' }} className="font-mono text-[10px] font-bold tracking-[0.25em] uppercase mb-1 block">
            CHAMPIONSHIP LEADERBOARD
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            Team Points <span style={{ color: 'var(--color-primary-accent)' }}>Standings</span>
          </h1>
        </div>

        {sortedHouses.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-[40vh] bg-[#161619] border border-[#2A2A32] rounded-2xl p-6">
            <div className="w-16 h-16 bg-[#1C1C20] rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl text-zinc-600 font-mono">0</span>
            </div>
            <h2 className="text-lg font-bold text-white mb-2 font-mono uppercase tracking-widest">No Houses Registered</h2>
            <p className="text-zinc-500 text-sm max-w-sm">
              Team standings will appear here once houses are added and results are published.
            </p>
          </div>
        ) : (
          <>
            {/* Podium Top 3 Cards - Dynamically centered for 1, 2, or 3+ teams */}
            <div className={`mb-10 sm:mb-12 ${
              sortedHouses.length === 1 
                ? 'flex justify-center max-w-md mx-auto' 
                : sortedHouses.length === 2 
                ? 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto' 
                : 'grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-center'
            }`}>
              {/* Rank 02 Card (Second Place) */}
              {top2 && (
                <div className="bg-[#161619] border border-[#2A2A32] rounded-2xl p-5 text-center shadow-lg order-2 md:order-1 flex-1">
                  <span className="text-zinc-400 text-[10px] font-bold font-mono tracking-widest uppercase mb-1 block">
                    SECOND PLACE
                  </span>
                  <div className="text-3xl font-black font-mono text-zinc-400 mb-2">02</div>
                  <h3 className="text-base font-extrabold text-white mb-1 font-sans">{top2.name}</h3>
                  <div className="text-sm font-bold font-mono text-zinc-300">
                    {top2.totalPoints} <span className="text-[10px] text-zinc-500 font-mono">POINTS</span>
                  </div>
                </div>
              )}

              {/* Rank 01 Card (Center Champion) */}
              {top1 && (
                <div style={{ borderColor: 'var(--color-primary-accent)' }} className="bg-[#161619] border-2 rounded-2xl p-6 text-center shadow-2xl relative order-1 md:order-2 flex-1">
                  <div style={{ backgroundColor: 'var(--color-primary-accent)' }} className="absolute -top-3 left-1/2 -translate-x-1/2 text-white font-mono font-black text-[9px] uppercase px-3 py-0.5 rounded-full tracking-widest shadow-md">
                    LEADING
                  </div>
                  <span style={{ color: 'var(--color-primary-accent)' }} className="text-[10px] font-bold font-mono tracking-widest uppercase mb-1 block pt-1">
                    FIRST PLACE
                  </span>
                  <div style={{ color: 'var(--color-primary-accent)' }} className="text-4xl sm:text-5xl font-black font-mono mb-2">01</div>
                  <h3 className="text-lg sm:text-xl font-black text-white mb-1 font-sans">{top1.name}</h3>
                  <div style={{ color: 'var(--color-primary-accent)' }} className="text-base font-black font-mono">
                    {top1.totalPoints} <span className="text-[10px] text-zinc-400 font-mono">POINTS</span>
                  </div>
                </div>
              )}

              {/* Rank 03 Card (Third Place) */}
              {top3 && (
                <div className="bg-[#161619] border border-[#2A2A32] rounded-2xl p-5 text-center shadow-lg order-3 flex-1">
                  <span className="text-zinc-400 text-[10px] font-bold font-mono tracking-widest uppercase mb-1 block">
                    THIRD PLACE
                  </span>
                  <div className="text-3xl font-black font-mono text-zinc-500 mb-2">03</div>
                  <h3 className="text-base font-extrabold text-white mb-1 font-sans">{top3.name}</h3>
                  <div className="text-sm font-bold font-mono text-zinc-300">
                    {top3.totalPoints} <span className="text-[10px] text-zinc-500 font-mono">POINTS</span>
                  </div>
                </div>
              )}
            </div>

            {/* Final Table Section */}
            <div className="bg-[#141416] border border-[#2A2A30] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
              {/* Table Header Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A2A30] pb-4">
                <div>
                  <span style={{ color: 'var(--color-primary-accent)' }} className="text-[10px] font-bold font-mono tracking-widest uppercase block mb-0.5">
                    FULL HOUSE STANDINGS
                  </span>
                  <h2 className="text-lg font-bold text-white tracking-tight font-sans">
                    {sortedHouses.length} Teams Ranked
                  </h2>
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Find a team..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1C1C20] border border-[#33333C] focus:border-white rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono placeholder:text-zinc-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Table List */}
              <div className="space-y-3">
                {filteredHouses.length > 0 ? filteredHouses.map((house) => {
                  const rankNum = (sortedHouses.findIndex((h) => h.id === house.id) + 1)
                    .toString()
                    .padStart(2, '0');
                  const percentage = maxPoints > 0 ? Math.min(100, Math.round((house.totalPoints / maxPoints) * 100)) : 80;

                  return (
                    <div
                      key={house.id}
                      className="p-3.5 bg-[#18181C] border border-[#282830] rounded-xl flex flex-col space-y-2 hover:border-white/30 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-zinc-400">
                            {rankNum}
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-white font-mono">{house.name}</h3>
                        </div>

                        <div className="text-xs sm:text-sm font-bold font-mono text-white">
                          {house.totalPoints} <span className="text-[10px] text-zinc-500 font-mono">PTS</span>
                        </div>
                      </div>

                      {/* Score Bar */}
                      <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${percentage}%`, backgroundColor: 'var(--color-primary-accent)' }}
                        />
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8 text-zinc-500 font-mono text-xs">
                    No matching teams found.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
