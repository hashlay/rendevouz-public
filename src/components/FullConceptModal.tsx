import React from 'react';
import { FULL_CONCEPT_TEXT } from '../data/festivalData';
import { X, ShieldCheck } from 'lucide-react';

interface FullConceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  cmsSettings?: any;
}

export const FullConceptModal: React.FC<FullConceptModalProps> = ({ isOpen, onClose, cmsSettings }) => {
  if (!isOpen) return null;

  const primaryColor = cmsSettings?.primaryColor || cmsSettings?.primaryAccent || 'var(--color-primary-accent, #18BA46)';

  // Safe paragraph resolution - strictly ensures an Array of strings is returned
  const paragraphs: string[] = React.useMemo(() => {
    if (
      typeof cmsSettings?.conceptModalDescription === 'string' &&
      cmsSettings.conceptModalDescription.trim() &&
      !cmsSettings.conceptModalDescription.toUpperCase().includes('TABASSUM') &&
      !cmsSettings.conceptModalDescription.toUpperCase().includes('NOORUL')
    ) {
      return cmsSettings.conceptModalDescription.split('\n').map((s: string) => s.trim()).filter(Boolean);
    }

    if (Array.isArray(FULL_CONCEPT_TEXT?.paragraphs) && FULL_CONCEPT_TEXT.paragraphs.length > 0) {
      return FULL_CONCEPT_TEXT.paragraphs;
    }

    if (typeof (FULL_CONCEPT_TEXT as any) === 'string') {
      return (FULL_CONCEPT_TEXT as any).split('\n\n').map((s: string) => s.trim()).filter(Boolean);
    }

    return [
      "FANOUS 2K26 is the premier annual arts, literary, and cultural festival presented by Swalahul Huda Academy, functioning under the guidance and management of Rifayiya Juma Masjid Muchila.",
      "Commemorating the auspicious occasion of Meelad Fest, FANOUS stands as a radiant beacon of intellectual illumination, spiritual devotion, and artistic excellence.",
      "The festival is designed to nurture and showcase the multidimensional talents of students across diverse artistic, literary, and oratory disciplines.",
      "With comprehensive judging standards, dynamic digital tabulation, and an inspiring celebration of youth potential, FANOUS 2K26 unites students, teachers, and the broader community."
    ];
  }, [cmsSettings?.conceptModalDescription]);

  const modalTitle = (!cmsSettings?.conceptModalTitle || cmsSettings.conceptModalTitle.toUpperCase().includes('SMILE') || cmsSettings.conceptModalTitle.toUpperCase().includes('TABASSUM'))
    ? (FULL_CONCEPT_TEXT?.title || 'FANOUS 2K26 — MEELAD FEST')
    : cmsSettings.conceptModalTitle;

  const modalSubtitle = (!cmsSettings?.conceptModalSubtitle || cmsSettings.conceptModalSubtitle.toUpperCase().includes('NOORUL'))
    ? (FULL_CONCEPT_TEXT?.institution || 'Swalahul Huda Academy • Under Rifayiya Juma Masjid Muchila')
    : cmsSettings.conceptModalSubtitle;

  const modalBadge = cmsSettings?.conceptModalBadge || FULL_CONCEPT_TEXT?.badge || 'Festival Concept & Vision';
  const modalFooter = (!cmsSettings?.conceptModalFooter || cmsSettings.conceptModalFooter.toUpperCase().includes('TABASSUM') || cmsSettings.conceptModalFooter.toUpperCase().includes('RENDEZVOUS'))
    ? 'FANOUS 2K26 • Swalahul Huda Academy'
    : cmsSettings.conceptModalFooter;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200 py-8" onClick={onClose}>
      <div className="bg-[#141414] border border-white/20 rounded-3xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl relative text-left my-auto max-h-[90vh] flex flex-col overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 text-zinc-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest mb-2" style={{ color: primaryColor }}>
          <span>{modalBadge}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-2">
          {modalTitle}
        </h2>

        <p className="text-xs font-mono text-zinc-400 border-b border-white/10 pb-4 mb-6">
          {modalSubtitle}
        </p>

        {/* Paragraphs */}
        <div className="space-y-4 text-zinc-300 text-sm sm:text-base leading-relaxed font-sans">
          {paragraphs.map((p: string, idx: number) => (
            <p key={idx} className="relative pl-4 border-l-2" style={{ borderColor: primaryColor }}>
              {p}
            </p>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" style={{ color: primaryColor }} />
            <span>{modalFooter}</span>
          </div>
          <button
            onClick={onClose}
            style={{ backgroundColor: primaryColor }}
            className="px-6 py-2.5 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg hover:brightness-110 cursor-pointer"
          >
            Close Reader
          </button>
        </div>
      </div>
    </div>
  );
};
