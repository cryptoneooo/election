'use client';

import { useState } from 'react';

interface TranscriptBlockProps {
  text: string;
  variant?: 'transcript' | 'bulletin';
}

export default function TranscriptBlock({ text, variant = 'transcript' }: TranscriptBlockProps) {
  const [open, setOpen] = useState(false);

  if (!text) return null;

  const isBulletin = variant === 'bulletin';
  const labelOpen = isBulletin ? '收合公報原文' : '收合逐字稿';
  const labelClosed = isBulletin ? '展開公報原文' : '展開逐字稿原文';
  const borderColor = isBulletin ? '#e67e22' : 'var(--gta-ochre)';

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--gta-ochre)',
          fontSize: '0.78rem',
          cursor: 'pointer',
          padding: '0.25rem 0',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
        }}
      >
        <span style={{
          display: 'inline-block',
          transition: 'transform 0.2s',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          fontSize: '0.7rem',
        }}>
          ▶
        </span>
        {open ? labelOpen : labelClosed}
        {isBulletin && (
          <span style={{
            fontSize: '0.65rem',
            background: 'rgba(230, 126, 34, 0.2)',
            color: '#e67e22',
            padding: '0.1rem 0.35rem',
            borderRadius: '3px',
            marginLeft: '0.2rem',
          }}>
            選舉公報
          </span>
        )}
      </button>
      {open && (
        <div
          style={{
            marginTop: '0.4rem',
            padding: '0.75rem',
            background: 'rgba(0,0,0,0.25)',
            borderRadius: '6px',
            borderLeft: `3px solid ${borderColor}`,
            fontSize: '0.82rem',
            lineHeight: 1.8,
            color: 'var(--text-secondary)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}
