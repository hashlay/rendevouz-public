import React from 'react';
import { INSTITUTION } from '../data/festivalData';
import { BookOpen, Sparkles, Award, ShieldCheck, ArrowRight, Quote } from 'lucide-react';

interface AboutSectionProps {
  onOpenConceptModal: () => void;
  cmsSettings?: any;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenConceptModal, cmsSettings }) => {
  return (
    <section id="about" className="py-10 sm:py-14 bg-[#121212] relative overflow-hidden border-t border-b border-white/5 font-sans">
      {/* Background ambient accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF2B2B]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-zinc-400/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-start mb-8 sm:mb-10">
          <div style={{ color: 'var(--color-primary-accent)', borderColor: 'var(--color-primary-accent)' }} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
            <span>{cmsSettings?.aboutBadge || 'Festival Vision'}</span>
          </div>
          <h2
            className="text-2xl sm:text-4xl font-extrabold text-white uppercase tracking-tight"
            dangerouslySetInnerHTML={{
              __html: (cmsSettings?.aboutMainHeading || 'ABOUT THE <span style="color: var(--color-primary-accent)">FESTIVAL</span>')
                .replace(/#FF2B2B/gi, 'var(--color-primary-accent)')
                .replace(/#ff2b2b/gi, 'var(--color-primary-accent)')
                .replace(/text-\[#FF2B2B\]/gi, '')
                .replace(/text-[#FF2B2B]/gi, '')
                .replace(/text-red-\d+/gi, '')
                .replace(/<span([^>]*)>/gi, (m, p1) => {
                  if (p1.includes('style=')) {
                    return `<span ${p1.replace(/style="([^"]*)"/gi, 'style="$1; color: var(--color-primary-accent)"')}>`;
                  }
                  return `<span ${p1} style="color: var(--color-primary-accent)">`;
                })
            }}
          />
          <div style={{ backgroundColor: 'var(--color-primary-accent)' }} className="w-16 h-1 mt-2 rounded-full" />
        </div>

        {/* 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Narrative Content */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-[#1A1A1A]/80 border border-white/10 rounded-2xl p-5 sm:p-7 backdrop-blur-xl relative">
              <div style={{ backgroundColor: 'var(--color-primary-accent)' }} className="absolute -top-3 -left-2 p-1.5 rounded-lg text-white shadow-md">
                <Quote className="w-4 h-4" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 pt-1">
                {cmsSettings?.aboutTitle || 'Kulliyathu Imam Rabbani'}
              </h3>
              <p style={{ color: 'var(--color-primary-accent)' }} className="text-xs font-semibold uppercase tracking-wider mb-3 font-mono">
                {cmsSettings?.aboutSubtitle || 'Off-Campus of Markaz Garden, Poonoor'}
              </p>

              <div className="text-zinc-300 text-xs sm:text-sm leading-relaxed mb-5 whitespace-pre-line">
                {cmsSettings?.aboutDescription || (
                  <>
                    <strong>Kulliyathu Imam Rabbani</strong> stands as a premier center of higher Islamic learning and academic excellence, functioning as a key off-campus institute under the revered banner of <strong>Markaz Garden, Poonoor</strong>.<br/><br/>
                    The <strong>Imam Rabbani LIFE Festival (Rendezvous Silver Edition)</strong> is an annual flagship celebration of intellectual, creative, and moral excellence. It brings together over 1200 students across 40+ disciplines.
                  </>
                )}
              </div>

              {/* Theme Breakdown Box */}
              <div className="bg-zinc-900/60 border rounded-xl p-4 mb-5" style={{ borderColor: 'var(--color-primary-accent)' }}>
                <div className="flex items-center gap-2 text-white font-bold text-xs mb-1.5">

                  <span>Theme: "{cmsSettings?.themeTitle || 'Decoding Phytolore'}"</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed italic whitespace-pre-line">
                  "{cmsSettings?.themeDescription || 'In an interconnected world, \'Decoding Phytolore\' calls upon the youth to explore the deeper symbiosis between nature, wisdom, spiritual clarity, and moral fortitude.'}"
                </p>
              </div>

              {/* CTA Modal Button */}
              <button
                onClick={onOpenConceptModal}
                style={{ backgroundColor: 'var(--color-primary-accent)' }}
                className="group inline-flex items-center gap-2.5 px-5 py-2.5 hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{cmsSettings?.themeButtonText || 'Read Festival Concept'}</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: High-Resolution Inauguration Photo Card */}
          <div className="lg:col-span-5">
            <div className="relative group rounded-2xl overflow-hidden border border-white/15 bg-[#181818] shadow-xl">
              {/* Photo Frame */}
              <div className="relative aspect-[4/3] sm:aspect-[16/11] overflow-hidden">
                <img
                  src={cmsSettings?.aboutImage || "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80"}
                  alt="Students at Imam Rabbani on Stage"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 filter brightness-95 contrast-105"
                  referrerPolicy="no-referrer"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/40 to-transparent" />

                {/* Badge Overlay */}
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: 'var(--color-primary-accent)' }} />
                  <span className="text-[9px] font-mono font-bold text-white uppercase tracking-wider">
                    {cmsSettings?.aboutImageBadge || 'Inauguration Session'}
                  </span>
                </div>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-widest block font-mono" style={{ color: 'var(--color-primary-accent)' }}>
                    {cmsSettings?.aboutImageTitle || 'Kulliyathu Imam Rabbani'}
                  </span>
                  <h4 className="text-base font-extrabold text-white leading-tight">
                    {cmsSettings?.aboutImageSubtitle || 'Distinguished Scholars & Dignitaries at Grand Assembly'}
                  </h4>
                  <p className="text-[11px] text-zinc-300 mt-0.5">
                    {cmsSettings?.aboutImageLocation || 'Main Stage Auditorium • Markaz Garden Campus'}
                  </p>
                </div>
              </div>

              {/* Card Footer details */}
              <div className="p-3 bg-[#141414] border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" style={{ color: 'var(--color-primary-accent)' }} />
                  <span>{cmsSettings?.aboutImageFooter || 'Markaz Garden Off-Campus'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
