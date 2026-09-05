import React, { useEffect, useRef, useState } from 'react';
import { useFestival } from '../context/FestivalContext';

interface CertificateImageProps {
  participantName: string;
  competitionName: string;
  competitionId?: string;
  rank: number;
  className?: string;
  onLoadUrl?: (url: string) => void;
}

const publicCertImageCache = new Map<string, HTMLImageElement>();

export const CertificateImage: React.FC<CertificateImageProps> = ({ 
  participantName, competitionName, competitionId, rank, className = '', onLoadUrl 
}) => {
  const { eventSettings } = useFestival();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>('');

  const onLoadRef = useRef(onLoadUrl);
  onLoadRef.current = onLoadUrl;

  useEffect(() => {
    let active = true;
    
    const drawFallbackCertificate = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      canvas.width = 1200;
      canvas.height = 850;

      // Dark elegant background
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 850);
      bgGrad.addColorStop(0, '#0F0F12');
      bgGrad.addColorStop(0.5, '#1A1A22');
      bgGrad.addColorStop(1, '#0A0A0C');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 850);

      // Gold / Silver / Bronze border
      ctx.strokeStyle = rank === 1 ? '#F59E0B' : rank === 2 ? '#E5E7EB' : '#D97706';
      ctx.lineWidth = 12;
      ctx.strokeRect(30, 30, 1140, 790);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.strokeRect(45, 45, 1110, 760);

      // Header
      ctx.fillStyle = '#FF2B2B';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('RENDEZVOUS SILVER EDITION', 600, 120);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 46px sans-serif';
      ctx.fillText('CERTIFICATE OF MERIT', 600, 190);

      ctx.fillStyle = '#A1A1AA';
      ctx.font = '18px sans-serif';
      ctx.fillText('THIS IS PROUDLY PRESENTED TO', 600, 260);

      // Participant Name
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText(participantName.toUpperCase(), 600, 335);

      ctx.fillStyle = '#A1A1AA';
      ctx.font = '18px sans-serif';
      ctx.fillText(`for securing RANK #${rank} in`, 600, 420);

      // Competition Name
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(competitionName.toUpperCase(), 600, 490);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.moveTo(150, 710);
      ctx.lineTo(400, 710);
      ctx.moveTo(800, 710);
      ctx.lineTo(1050, 710);
      ctx.stroke();

      ctx.fillStyle = '#71717A';
      ctx.font = '14px sans-serif';
      ctx.fillText('CONVENER', 275, 735);
      ctx.fillText('GENERAL SECRETARY', 925, 735);

      const url = canvas.toDataURL('image/webp', 0.92) || canvas.toDataURL('image/jpeg', 0.95);
      if (active) {
        setDataUrl(url);
        if (onLoadRef.current) onLoadRef.current(url);
      }
    };

    const generate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const compKey = `${competitionId || competitionName}_${rank}`;
      const compSpecificConfig = eventSettings?.certificateTemplateConfig?.[compKey];
      const globalRankConfig = eventSettings?.certificateTemplateConfig?.[rank] || {};
      const templateConfig = compSpecificConfig || globalRankConfig;
      const nameX = templateConfig.nameX ?? (rank === 1 ? -151 : -125);
      const nameY = templateConfig.nameY ?? 461;
      const compX = templateConfig.compX ?? (rank === 1 ? -37 : -30);
      const compY = templateConfig.compY ?? 553;
      const nameSize = templateConfig.nameSize ?? 33;
      const compSize = templateConfig.compSize ?? 25;
      const defaultColor = rank === 1 ? '#cc0000' : '#000000';
      const nameColor = templateConfig.nameColor ?? defaultColor;
      const compColor = templateConfig.compColor ?? defaultColor;
      const nameFont = templateConfig.nameFont || '"Montserrat", "Inter", sans-serif';
      const compFont = templateConfig.compFont || '"Montserrat", "Inter", sans-serif';

      const displayName = eventSettings?.certificateOverrides?.[`${compKey}_${participantName}`] || eventSettings?.certificateOverrides?.[participantName] || participantName;
      const displayComp = eventSettings?.certificateOverrides?.[`comp_${competitionId || competitionName}`] || eventSettings?.certificateOverrides?.[`comp_${competitionName}`] || competitionName;

      const customUrl = rank === 1 
        ? eventSettings?.certTheme1Url 
        : rank === 2 
          ? eventSettings?.certTheme2Url 
          : eventSettings?.certTheme3Url;
      const fallbackUrl = rank === 1 ? '/certificate_1.jpg' : '/certificate_2.jpg';
      const targetUrl = customUrl || fallbackUrl;
      
      const cached = publicCertImageCache.get(targetUrl);
      if (cached && cached.complete && cached.naturalWidth > 0) {
        tryRenderImage(cached);
        return;
      }

      const img = new Image();
      if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        publicCertImageCache.set(targetUrl, img);
        if (!active) return;
        tryRenderImage(img);
      };
      img.onerror = () => {
        if (!active) return;
        drawFallbackCertificate(canvas, ctx);
      };
      img.src = targetUrl;
      
      const tryRenderImage = (imageElement: HTMLImageElement) => {
        try {
          ctx.canvas.width = imageElement.width || 1200;
          ctx.canvas.height = imageElement.height || 850;
          ctx.drawImage(imageElement, 0, 0, imageElement.width, imageElement.height);

          const centerX = imageElement.width / 2;

          const fillMultiLinePublicText = (
            rawText: string,
            x: number,
            y: number,
            fontSize: number,
            fontStyle: string,
            color: string,
            align: CanvasTextAlign = 'center'
          ) => {
            ctx.fillStyle = color;
            ctx.font = fontStyle;
            ctx.textAlign = align;
            ctx.textBaseline = 'bottom';

            const textStr = (rawText || '').toUpperCase();
            const lines = textStr.split('\n').filter(Boolean);
            if (lines.length <= 1) {
              ctx.fillText(lines[0] || '', x, y);
              return;
            }
            const lineGap = fontSize * 1.15;
            const startY = y - ((lines.length - 1) * lineGap);
            lines.forEach((line, i) => {
              ctx.fillText(line, x, startY + i * lineGap);
            });
          };

          fillMultiLinePublicText(
            displayName || 'PARTICIPANT NAME',
            centerX + nameX,
            nameY,
            nameSize,
            `bold ${nameSize}px ${nameFont}`,
            nameColor,
            'center'
          );

          fillMultiLinePublicText(
            displayComp || 'COMPETITION',
            centerX + compX,
            compY,
            compSize,
            `bold ${compSize}px ${compFont}`,
            compColor,
            'left'
          );

          const url = canvas.toDataURL('image/webp', 0.92) || canvas.toDataURL('image/jpeg', 0.95);
          if (active) {
            setDataUrl(url);
            if (onLoadRef.current) onLoadRef.current(url);
          }
        } catch (err) {
          console.warn("Certificate canvas draw error, using programmatic fallback:", err);
          drawFallbackCertificate(canvas, ctx);
        }
      };

      img.onload = () => {
        if (!active) return;
        tryRenderImage(img);
      };

      img.onerror = () => {
        if (!active) return;
        if (customUrl && !img.src.endsWith(fallbackUrl)) {
          const fallbackImg = new Image();
          if (fallbackUrl.startsWith('http://') || fallbackUrl.startsWith('https://')) {
            fallbackImg.crossOrigin = 'anonymous';
          }
          fallbackImg.onload = () => {
            if (active) tryRenderImage(fallbackImg);
          };
          fallbackImg.onerror = () => {
            if (active) drawFallbackCertificate(canvas, ctx);
          };
          fallbackImg.src = fallbackUrl;
        } else {
          drawFallbackCertificate(canvas, ctx);
        }
      };

      img.src = targetUrl;
    };
    
    generate();

    return () => {
      active = false;
    };
  }, [participantName, competitionName, rank, eventSettings]);

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {dataUrl ? (
        <img src={dataUrl} alt={`Certificate for ${participantName}`} className={className} loading="lazy" />
      ) : (
        <div className={`flex items-center justify-center bg-[#1A1A1E] text-zinc-600 font-mono text-xs animate-pulse ${className}`}>
          Generating...
        </div>
      )}
    </>
  );
};
