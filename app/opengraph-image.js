import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'StarScoop Daily — Celebrity News, Bollywood, Hollywood & More';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #cc0000 0%, #880000 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background pattern dots */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          display: 'flex',
        }} />

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
          <div style={{
            background: 'white',
            color: '#cc0000',
            fontWeight: 900,
            fontSize: '52px',
            width: '80px',
            height: '80px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            ★
          </div>
          <div style={{
            color: 'white',
            fontWeight: 900,
            fontSize: '76px',
            letterSpacing: '-2px',
            display: 'flex',
            textShadow: '0 2px 12px rgba(0,0,0,0.2)',
          }}>
            StarScoop Daily
          </div>
        </div>

        {/* Divider */}
        <div style={{
          width: '120px',
          height: '4px',
          background: 'rgba(255,255,255,0.4)',
          borderRadius: '2px',
          marginBottom: '28px',
          display: 'flex',
        }} />

        {/* Subtitle */}
        <div style={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: '30px',
          fontWeight: 500,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
        }}>
          <span>Celebrity News</span>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>·</span>
          <span>Bollywood</span>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>·</span>
          <span>Hollywood</span>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>·</span>
          <span>Entertainment</span>
        </div>

        {/* Bottom URL */}
        <div style={{
          position: 'absolute',
          bottom: '32px',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '20px',
          letterSpacing: '0.05em',
          display: 'flex',
        }}>
          www.starscoopdaily.site
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
