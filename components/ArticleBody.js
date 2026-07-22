'use client';
import { useEffect, useRef } from 'react';

export default function ArticleBody({ html, className = '' }) {
  const ref = useRef();

  useEffect(() => {
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
  }, [html]);

  return (
    <div
      ref={ref}
      className={`article-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
