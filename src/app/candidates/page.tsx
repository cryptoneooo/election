'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAllCandidates } from '@/lib/data';
import { DISTRICTS, PARTY_INFO } from '@/lib/types';
import CandidateCard from '@/components/CandidateCard';

const PARTY_FILTERS = Object.entries(PARTY_INFO).map(([full, info]) => ({
  full,
  short: info.short,
  code: info.code,
}));

export default function CandidatesPageWrapper() {
  return (
    <Suspense fallback={<div className="page-container" style={{ color: 'var(--text-muted)' }}>載入中...</div>}>
      <CandidatesPageInner />
    </Suspense>
  );
}

function CandidatesPageInner() {
  const searchParams = useSearchParams();
  const [partyFilter, setPartyFilter] = useState<string | null>(
    searchParams.get('party') ?? null
  );
  const [districtFilter, setDistrictFilter] = useState<string | null>(
    searchParams.get('district') ?? null
  );

  const candidates = getAllCandidates();

  // Party filter matches by full party name
  const filtered = candidates
    .filter((c) => !partyFilter || c.party === partyFilter)
    .sort((a, b) => a.ballot_number - b.ballot_number);

  return (
    <div className="page-container animate-in">
      <h1 className="gta-title" style={{ fontSize: '1.5rem', margin: '0 0 1rem' }}>
        候選人一覽
      </h1>

      {/* Party filter */}
      <div className="chip-scroll" style={{ marginBottom: '0.5rem' }}>
        <button
          className={`filter-chip ${!partyFilter ? 'filter-chip--active' : ''}`}
          onClick={() => setPartyFilter(null)}
        >
          全部政黨
        </button>
        {PARTY_FILTERS.map((p) => (
          <button
            key={p.full}
            className={`filter-chip ${partyFilter === p.full ? 'filter-chip--active' : ''}`}
            onClick={() => setPartyFilter(partyFilter === p.full ? null : p.full)}
          >
            {p.short}
          </button>
        ))}
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0 0.75rem' }}>
        共 {filtered.length} 位候選人
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.map((c) => (
          <CandidateCard key={c.id} candidate={c} />
        ))}
      </div>
    </div>
  );
}
