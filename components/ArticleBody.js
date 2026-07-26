'use client';
import { useEffect, useRef } from 'react';

function buildEmbed(url) {
  const u = url.trim();
  if (u.includes('twitter.com') || u.includes('x.com')) {
    return `<div style="display:flex;justify-content:center;margin:24px 0">
      <blockquote class="twitter-tweet" data-dnt="true" data-theme="light">
        <a href="${u}"></a>
      </blockquote>
    </div>`;
  }
  if (u.includes('tiktok.com')) {
    const videoId = u.split('/').pop().split('?')[0];
    return `<div style="display:flex;justify-content:center;margin:24px 0">
      <blockquote class="tiktok-embed" cite="${u}" data-video-id="${videoId}" style="max-width:605px;min-width:325px">
        <section></section>
      </blockquote>
    </div>`;
  }
  if (u.includes('instagram.com')) {
    return `<div style="display:flex;justify-content:center;margin:24px 0">
      <blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${u}" style="max-width:540px;width:calc(100% - 2px);border-radius:12px">
        <div style="padding:16px"><a href="${u}" target="_blank" rel="noopener noreferrer">View on Instagram ↗</a></div>
      </blockquote>
    </div>`;
  }
  // Generic fallback
  return `<div style="margin:24px 0;padding:16px;border:1px solid #e5e7eb;border-radius:8px;text-align:center">
    <a href="${u}" target="_blank" rel="noopener noreferrer" style="color:#cc0000;font-weight:600">View post ↗</a>
  </div>`;
}

function processEmbeds(html) {
  if (!html) return '';
  return html.replace(/\[EMBED_MEDIA:\s*(https?:\/\/[^\]]+)\]/gi, (_, url) => buildEmbed(url));
}

function loadEmbedScript(src, id, onLoad) {
  if (document.getElementById(id)) { onLoad?.(); return; }
  const s = document.createElement('script');
  s.src = src; s.id = id; s.async = true;
  s.onload = onLoad;
  document.body.appendChild(s);
}

export default function ArticleBody({ html, className = '' }) {
  const ref = useRef();
  const processed = processEmbeds(html);

  useEffect(() => {
    // Portrait/landscape image sizing
    const imgs = ref.current?.querySelectorAll('figure img') || [];
    imgs.forEach((img) => {
      const apply = () => {
        const isPortrait = img.naturalHeight > img.naturalWidth;
        const figure = img.closest('figure');
        if (isPortrait) {
          img.style.width = '85%';
          img.style.maxWidth = '560px';
          img.style.height = 'auto';
          img.style.display = 'block';
          img.style.margin = '0 auto';
          if (figure) figure.style.textAlign = 'center';
        } else {
          img.style.width = '100%';
          img.style.height = 'auto';
        }
      };
      if (img.complete && img.naturalWidth) apply();
      else img.addEventListener('load', apply);
    });

    // Load social embed scripts if needed
    if (processed.includes('twitter-tweet')) {
      loadEmbedScript('https://platform.twitter.com/widgets.js', 'twitter-widgets', () => {
        window.twttr?.widgets?.load(ref.current);
      });
      window.twttr?.widgets?.load(ref.current);
    }
    if (processed.includes('tiktok-embed')) {
      loadEmbedScript('https://www.tiktok.com/embed.js', 'tiktok-embed');
    }
    if (processed.includes('instagram-media')) {
      loadEmbedScript('https://www.instagram.com/embed.js', 'instagram-embed', () => {
        window.instgrm?.Embeds?.process();
      });
      window.instgrm?.Embeds?.process();
    }
  }, [html, processed]);

  return (
    <div
      ref={ref}
      className={`article-content ${className}`}
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  );
}
