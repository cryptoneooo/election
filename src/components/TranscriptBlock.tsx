'use client';

import { useState } from 'react';

export default function TranscriptBlock({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  if (!text) return null;

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
        {open ? '收合逐字稿' : '展開逐字稿原文'}
      </button>
      {open && (
        <div
          style={{
            marginTop: '0.4rem',
            padding: '0.75rem',
            background: 'rgba(0,0,0,0.25)',
            borderRadius: '6px',
            borderLeft: '3px solid var(--gta-ochre)',
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
