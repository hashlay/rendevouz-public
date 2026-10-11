import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { VideoHighlight } from '../types';
import { Play, X, Download, Share2, Video, Check } from 'lucide-react';
import { getMediaUrl } from '../utils/mediaUrl';
import { shareMediaFile } from '../utils/shareUtils';
import { useFestival } from '../context/FestivalContext';

// Lazy-rendered card that only mounts when visible in viewport
const VideoCard: React.FC<{
  video: VideoHighlight;
  onPlay: (v: VideoHighlight) => void;
}> = React.memo(({ video, onPlay }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={() => onPlay(video)}
      className="group cursor-pointer space-y-2"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-[#18181B] border border-white/10 shadow-md sm:group-hover:border-white/30 transition-colors">
        {isVisible ? (
          video.thumbnailUrl ? (
            <img
              src={getMediaUrl(video.thumbnailUrl)}
              alt={video.title}
              className="w-full h-full object-cover will-change-transform sm:group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.dataset.triedFallback && video.videoUrl) {
                  target.dataset.triedFallback = 'true';
                  target.src = getMediaUrl(video.videoUrl);
                }
              }}
            />
          ) : (
            <video
              src={getMediaUrl(video.videoUrl)}
              preload="metadata"
              muted
              playsInline
              className="w-full h-full object-cover opacity-90 sm:group-hover:scale-105 transition-transform duration-500 pointer-events-none"
              onError={(e) => {
                const target = e.target as HTMLVideoElement;
                if (!target.dataset.triedFallback && video.videoUrl) {
                  target.dataset.triedFallback = 'true';
                  target.src = getMediaUrl(video.videoUrl);
                }
              }}
            />
          )
        ) : (
          <div className="w-full h-full bg-[#18181B] animate-pulse" />
        )}

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-black/40 sm:group-hover:bg-black/20 transition-colors" />

        {/* Red Circular Play Button in Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ backgroundColor: 'var(--color-primary-accent)' }} className="w-10 h-10 rounded-full text-white flex items-center justify-center shadow-lg sm:group-hover:scale-110 transition-transform duration-300">
            <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Title Text Underneath */}
      <div className="text-left">
        <h3 className="text-[11px] font-mono font-bold text-zinc-200 uppercase tracking-wide line-clamp-2 sm:group-hover:text-amber-400 transition-colors leading-snug">
          {video.title}
        </h3>
        <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{video.performer}</p>
      </div>
    </div>
  );
});

VideoCard.displayName = 'VideoCard';

export const VideoHighlights: React.FC = React.memo(() => {
  const { eventSettings } = useFestival();
  const [activeVideo, setActiveVideo] = useState<VideoHighlight | null>(null);
  const [highlights, setHighlights] = useState<VideoHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/public/highlights')
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setHighlights(data || []);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to fetch highlights:', err);
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handlePlay = useCallback((video: VideoHighlight) => {
    setActiveVideo(video);
  }, []);

  const handleClose = useCallback(() => {
    setActiveVideo(null);
  }, []);

  useEffect(() => {
    if (activeVideo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeVideo]);

  const handleShare = useCallback(async (video: VideoHighlight) => {
    if (sharingId) return;
    setSharingId(video.id);
    const festTitle = eventSettings?.festivalName || 'Imam Rabbani Life Festival';
    const lines: string[] = [];
    lines.push(`🎬 *${video.title}*`);
    const meta: string[] = [];
    if (video.performer) meta.push(`🎤 Performer: ${video.performer}`);
    if (video.stageName) meta.push(`📍 Stage: ${video.stageName}`);
    if (video.event) meta.push(`🏆 Event: ${video.event}`);
    if (meta.length > 0) lines.push(meta.join('\n'));
    lines.push(`\n✨ *${festTitle}*`);

    const result = await shareMediaFile({
      title: video.title,
      caption: lines.join('\n'),
      mediaUrl: video.thumbnailUrl || undefined,
      fileName: `${video.title}_highlight`,
      fallbackUrl: video.videoUrl
    });

    setSharingId(null);
    if (result === 'copied') {
      setCopiedId(video.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  }, [eventSettings?.festivalName, sharingId]);

  const handleDownload = useCallback((video: VideoHighlight) => {
    const a = document.createElement('a');
    a.href = getMediaUrl(video.videoUrl);
    a.download = `${video.title.replace(/\s+/g, '_')}_highlight.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  return (
    <section id="highlights" className="py-10 sm:py-14 bg-[#0E0E10] relative overflow-hidden border-b border-white/10 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="mb-6 border-b border-white/10 pb-5">
          <span style={{ color: 'var(--color-primary-accent)' }} className="font-mono text-[10px] font-bold tracking-[0.25em] uppercase mb-0.5 block">
            REPLAY
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            Videos
          </h2>
          <p className="text-zinc-400 text-xs font-sans mt-0.5">
            Recaps and moments worth a second watch.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div style={{ borderColor: 'var(--color-primary-accent)', borderTopColor: 'transparent' }} className="w-8 h-8 border-2 rounded-full animate-spin" />
          </div>
        ) : highlights.length === 0 ? (
          <div className="text-center py-20 bg-[#18181B]/50 rounded-2xl border border-white/5">
            <Video className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 font-medium">No highlights available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {highlights.map((video) => (
              <VideoCard key={video.id} video={video} onPlay={handlePlay} />
            ))}
          </div>
        )}
      </div>

      {/* Video Modal Player rendered directly on document.body via Portal */}
      {activeVideo && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={handleClose}
        >
          <div
            className="relative max-w-4xl w-full bg-[#18181B] border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header bar with close button */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 bg-[#141416] border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span style={{ color: 'var(--color-primary-accent)', borderColor: 'var(--color-primary-accent)' }} className="px-2 py-0.5 bg-white/5 border rounded text-[10px] font-mono font-bold uppercase tracking-wider">
                  {activeVideo.event}
                </span>
                <span className="text-xs text-zinc-400 font-mono uppercase">{activeVideo.stageName}</span>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 text-zinc-400 hover:text-white bg-white/5 border border-white/10 rounded-lg transition-colors cursor-pointer"
                aria-label="Close video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Container */}
            <div className="relative aspect-video bg-black flex-shrink-0">
              <video
                src={getMediaUrl(activeVideo.videoUrl)}
                title={activeVideo.title}
                className="w-full h-full object-contain"
                autoPlay
                controls
                controlsList="nodownload"
                playsInline
                preload="auto"
                onError={(e) => {
                  const target = e.target as HTMLVideoElement;
                  if (!target.dataset.triedFallback && activeVideo.videoUrl) {
                    target.dataset.triedFallback = 'true';
                    target.src = getMediaUrl(activeVideo.videoUrl);
                  }
                }}
              />
            </div>
            
            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-5 bg-[#121214] overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">{activeVideo.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1">Performer: <span className="text-zinc-200 font-mono">{activeVideo.performer}</span></p>
                </div>
                
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleShare(activeVideo)}
                    disabled={sharingId === activeVideo.id}
                    className="flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer min-h-[40px] disabled:opacity-50"
                  >
                    {copiedId === activeVideo.id ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        <span>{sharingId === activeVideo.id ? 'Opening...' : 'Share'}</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDownload(activeVideo)}
                    style={{ backgroundColor: 'var(--color-primary-accent)' }}
                    className="flex items-center gap-2 px-3.5 py-2 hover:opacity-90 text-white rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer shadow-lg min-h-[40px]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download HD</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
});

VideoHighlights.displayName = 'VideoHighlights';
