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

  const primaryColor = cmsSettings?.primaryColor || cmsSettings?.primaryAccent || 'var(--color-primary-accent, #FF2B2B)';

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
          <span>{cmsSettings?.conceptModalBadge || (FULL_CONCEPT_TEXT as any).badge || 'Theme Concept & Philosophy'}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-2">
          {cmsSettings?.conceptModalTitle || FULL_CONCEPT_TEXT.title}
        </h2>

        <p className="text-xs font-mono text-zinc-400 border-b border-white/10 pb-4 mb-6">
          {cmsSettings?.conceptModalSubtitle || FULL_CONCEPT_TEXT.institution}
        </p>

        {/* Paragraphs */}
        <div className="space-y-4 text-zinc-300 text-sm sm:text-base leading-relaxed font-sans">
          {(cmsSettings?.conceptModalDescription ? cmsSettings.conceptModalDescription.split('\n').filter((p: string) => p.trim() !== '') : FULL_CONCEPT_TEXT.paragraphs).map((p: string, idx: number) => (
            <p key={idx} className="relative pl-4 border-l-2" style={{ borderColor: primaryColor }}>
              {p}
            </p>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" style={{ color: primaryColor }} />
            <span>{cmsSettings?.conceptModalFooter || (FULL_CONCEPT_TEXT as any).footer || 'Tabassum Meelad Fest'}</span>
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
