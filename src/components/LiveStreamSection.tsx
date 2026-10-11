import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useFestival } from '../context/FestivalContext';

export const LiveStreamSection: React.FC = () => {
  const { eventSettings } = useFestival();
  
  const extractYoutubeId = (url: string) => {
    if (!url) return '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : url;
  };

  const stages = [
    { id: 'stage-1', name: 'Stage 01', videoEmbedId: extractYoutubeId(eventSettings?.stage1LiveLink || '') },
    { id: 'stage-2', name: 'Stage 02', videoEmbedId: extractYoutubeId(eventSettings?.stage2LiveLink || '') }
  ];

  return (
    <section id="live" className="py-10 sm:py-14 bg-[#0E0E10] relative overflow-hidden border-b border-white/10 font-sans">
      {/* Background Glow */}
      <div
        style={{ backgroundColor: 'var(--color-primary-accent, #10b981)', opacity: 0.05 }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[200px] blur-[140px] pointer-events-none"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3 border-b border-white/10 pb-5">
          <div>
            <span style={{ color: 'var(--color-primary-accent)' }} className="font-mono text-[10px] font-bold tracking-[0.25em] uppercase mb-0.5 block">
              ON AIR
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Live now
            </h2>
            <p className="text-zinc-400 text-xs font-sans mt-0.5">
              Straight from the festival stages, as it happens.
            </p>
          </div>

          <a
            href="#live"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('live');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ color: 'var(--color-primary-accent)' }}
            className="font-bold text-xs font-mono tracking-wider hover:underline flex items-center gap-1.5 shrink-0 self-start sm:self-end uppercase cursor-pointer"
          >
            <span>PROGRAMME</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 2-Column Side-by-Side Live Stream Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className="bg-[#18181B] border border-white/10 rounded-xl overflow-hidden p-3 sm:p-4 space-y-2.5 shadow-xl relative transition-all"
            >
              {/* Video Player Frame */}
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
                {stage.videoEmbedId ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${stage.videoEmbedId}?autoplay=0&rel=0`}
                    title={stage.name}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <div className="text-zinc-500 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-700" />
                    No live
                  </div>
                )}
              </div>

              {/* Bottom Stream Status Badge */}
              <div className="flex items-center justify-between pt-1">
                <div className="inline-flex items-center gap-2 bg-[#121214] border border-white/10 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-zinc-300">
                  {stage.videoEmbedId ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span className="text-emerald-400 font-bold uppercase tracking-wider text-[9px]">LIVE</span>
                    </>
                  ) : (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-600" />
                      </span>
                      <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">OFFLINE</span>
                    </>
                  )}
                  <span className="text-zinc-500">•</span>
                  <span className="font-bold uppercase tracking-wider text-zinc-200 text-[10px]">
                    STAGE 0{index + 1}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
