import { getMediaUrl } from './mediaUrl';

export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      // Fallback below
    }
  }
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (_) {
    return false;
  }
};

export interface ShareMediaParams {
  title: string;
  caption: string;
  mediaUrl?: string;
  fileName?: string;
  fallbackUrl?: string;
}

/**
 * Shares a media item (image/video/thumbnail) using the device's native OS share dialog,
 * exactly like the Result Posters.
 * Falls back to text/URL share, and finally to copying caption & link to clipboard.
 */
export const shareMediaFile = async ({
  title,
  caption,
  mediaUrl,
  fileName,
  fallbackUrl
}: ShareMediaParams): Promise<'shared' | 'copied' | 'cancelled'> => {
  const fullFallbackUrl = fallbackUrl
    ? (fallbackUrl.startsWith('http') ? fallbackUrl : `${window.location.origin}${fallbackUrl}`)
    : window.location.href;

  // 1. Try native file sharing via Web Share API
  if (mediaUrl && navigator.canShare) {
    try {
      const resolvedUrl = getMediaUrl(mediaUrl);
      const res = await fetch(resolvedUrl);
      if (res.ok) {
        const blob = await res.blob();
        const mimeType = blob.type || 'image/jpeg';
        let ext = 'jpg';
        if (mimeType.includes('png')) ext = 'png';
        else if (mimeType.includes('webp')) ext = 'webp';
        else if (mimeType.includes('mp4')) ext = 'mp4';

        const safeName = (fileName || title || 'share')
          .replace(/[^\w\s-]/gi, '')
          .trim()
          .replace(/\s+/g, '_') || 'share';

        const file = new File([blob], `${safeName}.${ext}`, { type: mimeType });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title,
            text: caption,
            files: [file]
          });
          return 'shared';
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return 'cancelled';
      }
      console.warn('Native media file share failed, falling back to text/URL share:', err);
    }
  }

  // 2. Try native text/URL sharing via Web Share API
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: caption,
        url: fullFallbackUrl
      });
      return 'shared';
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return 'cancelled';
      }
      console.warn('Native text share failed, falling back to clipboard:', err);
    }
  }

  // 3. Fallback: Copy caption and URL to clipboard
  const fullTextToCopy = `${caption}\n\n${fullFallbackUrl}`.trim();
  await copyToClipboard(fullTextToCopy);
  return 'copied';
};
