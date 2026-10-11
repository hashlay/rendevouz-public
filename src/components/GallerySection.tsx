import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GalleryItem } from '../types';
import { ZoomIn, ArrowRight, X, ChevronLeft, ChevronRight, Download, Share2, Check, Send, Copy, Image as ImageIcon } from 'lucide-react';
import { getMediaUrl } from '../utils/mediaUrl';
import { useFestival } from '../context/FestivalContext';

interface GallerySectionProps {
  onNavigate?: (sectionId: string) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ onNavigate }) => {
  const { eventSettings } = useFestival();
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/public/gallery?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        const items = Array.isArray(data) ? data : [];
        const featuredItems = items.filter((item: GalleryItem) => item.isFeatured);
        const displayList = featuredItems.length > 0 ? featuredItems.slice(0, 8) : items.slice(0, 8);
        setGalleryItems(displayList);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch gallery:', err);
        setLoading(false);
      });
  }, []);

  const displayItems = galleryItems;

  useEffect(() => {
    if (activeItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeItem]);

  const handleNext = () => {
    if (!activeItem) return;
    const currentIndex = displayItems.findIndex(i => i.id === activeItem.id);
    const nextIndex = (currentIndex + 1) % displayItems.length;
    setActiveItem(displayItems[nextIndex]);
    setCopied(false);
    setShowShareMenu(false);
  };

  const handlePrev = () => {
    if (!activeItem) return;
    const currentIndex = displayItems.findIndex(i => i.id === activeItem.id);
    const prevIndex = (currentIndex - 1 + displayItems.length) % displayItems.length;
    setActiveItem(displayItems[prevIndex]);
    setCopied(false);
    setShowShareMenu(false);
  };

  const handleDownload = async (imageUrl: string, title: string) => {
    try {
      const mediaUrl = getMediaUrl(imageUrl);
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (_) {
      const a = document.createElement('a');
      a.href = getMediaUrl(imageUrl);
      a.download = `${title.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleShare = (item: GalleryItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `Check out this photo from ${eventSettings?.festivalName || 'the festival'}: ${item.title}`,
        url: window.location.origin + item.imageUrl,
      }).catch(() => setShowShareMenu(!showShareMenu));
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const handleCopyLink = (imageUrl: string) => {
    const fullUrl = window.location.origin + imageUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="gallery" className="py-10 sm:py-14 bg-[#0A0A0C] relative overflow-hidden border-b border-white/10 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 border-b border-white/10 pb-5 gap-4">
          <div>
            <span style={{ color: 'var(--color-primary-accent)' }} className="font-mono text-[10px] font-bold tracking-[0.25em] uppercase mb-0.5 block">
              MOMENTS
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Festival Gallery
            </h2>
            <p className="text-zinc-400 text-xs font-sans mt-0.5">
              High-resolution snapshots from various events.
            </p>
          </div>

          <button
            onClick={() => onNavigate && onNavigate('gallery')}
            style={{ color: 'var(--color-primary-accent)' }}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider hover:opacity-80 transition-opacity cursor-pointer self-start sm:self-auto"
          >
            <span>View All Photos ({galleryItems.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-[4/3] bg-[#161619] border border-[#2A2A32] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-16 bg-[#161619]/50 rounded-2xl border border-white/5">
            <p className="text-zinc-400 font-medium">No featured photos available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10">
            {displayItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => {
                  setActiveItem(item);
                  setCopied(false);
                  setShowShareMenu(false);
                }}
                className="group relative bg-[#161619] border border-[#2A2A32] rounded-xl overflow-hidden cursor-pointer shadow-md sm:hover:border-white/40 transition-colors duration-300 flex flex-col"
              >
                {/* Image Frame */}
                <div className="relative aspect-[4/3] overflow-hidden bg-black">
                  <img
                    src={getMediaUrl(item.imageUrl)}
                    alt={item.title}
                    className="w-full h-full object-cover will-change-transform sm:group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading={index < 4 ? "eager" : "lazy"}
                    decoding="async"
                  />

                  {/* Hover Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 sm:group-hover:opacity-90 transition-opacity" />

                  {/* Category Badge */}
                  <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-zinc-300 uppercase border border-white/10">
                    {item.category}
                  </div>

                  {/* Zoom Icon Button */}
                  <div className="absolute top-2 right-2 p-1 rounded-full text-white opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-md" style={{ backgroundColor: 'var(--color-primary-accent)' }}>
                    <ZoomIn className="w-3 h-3 text-white" />
                  </div>
                </div>

                {/* Title & Info */}
                <div className="p-2.5 bg-[#141417] border-t border-[#25252D] flex flex-col justify-between flex-1">
                  <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-white transition-colors">
                    {item.title}
                  </h3>
                  {item.date && (
                    <span className="text-[10px] font-mono text-zinc-400 mt-1 block">
                      {item.date}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Preview Modal rendered directly on document.body via Portal */}
      {activeItem && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => {
            setActiveItem(null);
            setShowShareMenu(false);
          }}
        >
          <div
            className="relative max-w-4xl w-full bg-[#18181B] border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header bar with title & close button */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 bg-[#141416] border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--color-primary-accent)', borderColor: 'var(--color-primary-accent)' }} className="px-2 py-0.5 bg-white/5 border rounded text-[10px] font-mono font-bold uppercase tracking-wider">
                  {activeItem.category || 'Gallery'}
                </span>
                <h3 className="text-sm font-bold text-white line-clamp-1">{activeItem.title}</h3>
              </div>
              <button
                onClick={() => {
                  setActiveItem(null);
                  setShowShareMenu(false);
                }}
                className="p-1.5 text-zinc-400 hover:text-white bg-white/5 border border-white/10 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Container with Prev/Next Navigation overlay */}
            <div className="relative w-full max-h-[60vh] bg-black flex items-center justify-center overflow-hidden flex-shrink-0">
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 text-zinc-200 hover:text-white bg-black/70 border border-white/15 rounded-full transition-colors z-20 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <img
                src={getMediaUrl(activeItem.imageUrl)}
                alt={activeItem.title}
                className="w-full h-full max-h-[60vh] object-contain"
                referrerPolicy="no-referrer"
                decoding="async"
              />

              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 text-zinc-200 hover:text-white bg-black/70 border border-white/15 rounded-full transition-colors z-20 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-[#121214] border-t border-white/10 overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-zinc-400 font-mono">
                  {activeItem.caption && <p className="text-zinc-300 font-sans mb-1">{activeItem.caption}</p>}
                  {activeItem.photographer && <span>Photo by {activeItem.photographer}</span>}
                </div>

                {/* Action Buttons Bar */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownload(activeItem.imageUrl, activeItem.title)}
                    style={{ backgroundColor: 'var(--color-primary-accent)' }}
                    className="px-4 py-2 hover:opacity-90 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-md cursor-pointer min-h-[38px]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>DOWNLOAD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare(activeItem)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-colors duration-200 flex items-center gap-1.5 shadow-md cursor-pointer min-h-[38px]"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copied ? 'COPIED!' : 'SHARE'}</span>
                  </button>
                </div>
              </div>

              {/* Share Options Drawer / Modal */}
              {showShareMenu && (
                <div className="mt-3 p-3 bg-[#18181C] border border-[#2D2D35] rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this photo from ${eventSettings?.festivalName || 'the festival'}: ${activeItem.title}\n${activeItem.imageUrl}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-[#25D366]/20 border border-[#25D366]/40 hover:bg-[#25D366] text-white text-xs font-mono font-bold uppercase rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(activeItem.imageUrl)}
                    style={{ backgroundColor: 'var(--color-primary-accent)' }}
                    className="px-3 py-1.5 border border-white/20 hover:opacity-90 text-white text-xs font-mono font-bold uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
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
