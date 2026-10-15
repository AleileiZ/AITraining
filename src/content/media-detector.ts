export interface DetectedMedia {
  kind: 'video' | 'audio';
  src: string;
  title?: string;
  poster?: string;
  duration?: number;
}

export interface DetectedMediaInfo {
  title: string;
  url: string;
  siteName: string;
  favicon: string | null;
  coverUrl: string | null;
  media: DetectedMedia | null;
}

export function detectMediaInfo(): DetectedMediaInfo {
  const doc = document;
  const title = (doc.title || '').trim() || location.hostname;
  const url = location.href;
  const siteName = (location.hostname || '').replace(/^www\./, '');

  let favicon: string | null = null;
  const iconLink = doc.querySelector<HTMLLinkElement>('link[rel~="icon"], link[rel="shortcut icon"]');
  if (iconLink && iconLink.href) {
    favicon = new URL(iconLink.href, location.href).href;
  }

  let media: DetectedMedia | null = null;
  const videos = Array.from(doc.querySelectorAll<HTMLVideoElement>('video'));
  const video =
    videos.find((v) => (v.currentSrc || v.src) && v.offsetWidth > 0) ||
    videos.find((v) => v.currentSrc || v.src) ||
    videos[0];
  if (video) {
    const src = video.currentSrc || (video.querySelector('source') as HTMLSourceElement | null)?.src || video.src || '';
    if (src) {
      media = {
        kind: 'video',
        src,
        title: video.getAttribute('title') || undefined,
        poster: video.poster || undefined,
        duration: Number.isFinite(video.duration) ? video.duration : undefined
      };
    }
  }
  if (!media) {
    const audios = Array.from(doc.querySelectorAll<HTMLAudioElement>('audio'));
    const audio = audios.find((a) => a.currentSrc || a.src) || audios[0];
    if (audio) {
      const src = audio.currentSrc || (audio.querySelector('source') as HTMLSourceElement | null)?.src || audio.src || '';
      if (src) {
        media = {
          kind: 'audio',
          src,
          title: audio.getAttribute('title') || undefined,
          duration: Number.isFinite(audio.duration) ? audio.duration : undefined
        };
      }
    }
  }

  const metaContent = (selector: string): string | null => {
    const el = doc.querySelector<HTMLMetaElement>(selector);
    const value = el && el.content ? el.content.trim() : '';
    return value || null;
  };
  const coverUrl =
    (media && media.kind === 'video' && media.poster) ||
    metaContent('meta[property="og:image"]') ||
    metaContent('meta[name="twitter:image"]');

  return { title, url, siteName, favicon, coverUrl: coverUrl || null, media };
}

const isWebPage = typeof location !== 'undefined' && /^https?:$/.test(location.protocol);
if (isWebPage && typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
  const info = detectMediaInfo();
  (window as unknown as Record<string, unknown>).__WEBTUNE_DETECTED__ = info;
  try {
    void chrome.runtime.sendMessage({ type: 'WEBTUNE_MEDIA_DETECTED', payload: info });
  } catch {
    /* 无接收方时忽略 */
  }
}
