'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { getAllFactChecks, getAllCandidates } from '@/lib/data';
import { VERDICT_CONFIG, type VerdictKey } from '@/lib/types';

export default function ChecksPageWrapper() {
  return (
    <Suspense fallback={<div className="page-container" style={{ color: 'var(--text-muted)' }}>載入中...</div>}>
      <ChecksPageInner />
    </Suspense>
  );
}

function ChecksPageInner() {
  const factChecks = getAllFactChecks();
  const candidates = getAllCandidates();
  const [verdictFilter, setVerdictFilter] = useState<VerdictKey | null>(null);
  const [candidateFilter, setCandidateFilter] = useState<string | null>(null);

  const candidateMap = new Map(candidates.map((c) => [c.id, c]));

  const filtered = factChecks
    .filter((fc) => !verdictFilter || fc.verdict === verdictFilter)
    .filter((fc) => !candidateFilter || fc.candidate_id === candidateFilter);

  const verdictKeys = Object.keys(VERDICT_CONFIG) as VerdictKey[];

  return (
    <div className="page-container animate-in">
      <h1 className="gta-title" style={{ fontSize: '1.5rem', margin: '0 0 1rem' }}>
        事實查核
      </h1>

      {/* Verdict filter */}
      <div className="chip-scroll" style={{ marginBottom: '0.5rem' }}>
        <button
          className={`filter-chip ${!verdictFilter ? 'filter-chip--active' : ''}`}
          onClick={() => setVerdictFilter(null)}
        >
          全部查核結果
        </button>
        {verdictKeys.map((vk) => {
          const vc = VERDICT_CONFIG[vk];
          return (
            <button
              key={vk}
              className={`filter-chip ${verdictFilter === vk ? 'filter-chip--active' : ''}`}
              onClick={() => setVerdictFilter(verdictFilter === vk ? null : vk)}
              style={
                verdictFilter === vk
                  ? { borderColor: vc.color, color: vc.color, background: `${vc.color}15` }
                  : {}
              }
            >
              {vc.icon} {vc.label}
            </button>
          );
        })}
      </div>

      {/* Candidate filter */}
      <div className="chip-scroll" style={{ marginBottom: '1rem' }}>
        <button
          className={`filter-chip ${!candidateFilter ? 'filter-chip--active' : ''}`}
          onClick={() => setCandidateFilter(null)}
        >
          全部候選人
        </button>
        {candidates
          .filter((c) => c.event_attendance === 'present')
          .sort((a, b) => a.ballot_number - b.ballot_number)
          .map((c) => (
            <button
              key={c.id}
              className={`filter-chip ${candidateFilter === c.id ? 'filter-chip--active' : ''}`}
              onClick={() => setCandidateFilter(candidateFilter === c.id ? null : c.id)}
            >
              {c.ballot_number} {c.name}
            </button>
          ))}
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.75rem' }}>
        共 {filtered.length} 則查核
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filtered.map((fc) => {
          const vc = VERDICT_CONFIG[fc.verdict];
          const cand = candidateMap.get(fc.candidate_id);
          return (
            <Link key={fc.id} href={`/checks/${fc.id}`} style={{ textDecoration: 'none' }}>
              <div className="gta-card" style={{ padding: '0.75rem 1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.4rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    className="verdict-chip"
                    style={{ borderColor: vc.color, color: vc.color, background: `${vc.color}15` }}
                  >
                    {vc.icon} {vc.label}
                  </span>
                  {cand && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {cand.ballot_number} {cand.name}
                    </span>
                  )}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {fc.claim}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
