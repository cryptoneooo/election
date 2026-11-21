import Link from 'next/link';
import {
  getAllCandidates,
  getMetadata,
  getDistrictPolicyCounts,
  getAllPolicies,
  getAllFactChecks,
} from '@/lib/data';
import { DISTRICTS } from '@/lib/types';
import CandidateCard from '@/components/CandidateCard';

export default function HomePage() {
  const metadata = getMetadata();
  const candidates = getAllCandidates();
  const districtCounts = getDistrictPolicyCounts();
  const totalPolicies = getAllPolicies().length;
  const totalChecks = getAllFactChecks().length;

  return (
    <div className="page-container animate-in">
      {/* Hero */}
      <header style={{ textAlign: 'center', padding: '2rem 0 1.5rem' }}>
        <h1
          className="gta-title"
          style={{ fontSize: 'clamp(1.8rem, 6vw, 2.6rem)', margin: 0, lineHeight: 1.2 }}
        >
          大文山政見地圖
        </h1>
        <p
          className="gta-subtitle"
          style={{ fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', margin: '0.5rem 0 0' }}
        >
          從你生活的地方，看候選人提出了什麼
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.75rem 0 0' }}>
          {metadata.election_year} 新北市議員第 {metadata.district_number} 選區
        </p>
      </header>

      {/* Stats bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          padding: '1rem 0',
          borderTop: '2px solid var(--border)',
          borderBottom: '2px solid var(--border)',
          margin: '0 0 1.5rem',
        }}
      >
        {[
          { n: candidates.length, label: '位候選人' },
          { n: totalPolicies, label: '項政見' },
          { n: totalChecks, label: '則查核' },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--gta-orange)' }}>
              {s.n}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* District quick links */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="gta-subtitle" style={{ fontSize: '1rem', margin: '0 0 0.75rem' }}>
          依行政區探索
        </h2>
        <div className="chip-scroll">
          {DISTRICTS.map((d) => (
            <Link key={d} href={`/map?district=${d}`} className="filter-chip" style={{ gap: '6px' }}>
              {d}
              <span style={{ color: 'var(--gta-orange)', fontWeight: 700 }}>
                {districtCounts[d] ?? 0}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link href="/candidates" className="gta-btn" style={{ flex: 1, justifyContent: 'center' }}>
          👤 看候選人
        </Link>
        <Link href="/map" className="gta-btn gta-btn--outline" style={{ flex: 1, justifyContent: 'center' }}>
          🗺 探索地圖
        </Link>
      </div>

      <hr className="gta-divider" />

      {/* Candidate cards */}
      <section>
        <h2 className="gta-subtitle" style={{ fontSize: '1rem', margin: '0 0 0.75rem' }}>
          全部候選人
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {candidates
            .sort((a, b) => a.ballot_number - b.ballot_number)
            .map((c) => (
              <CandidateCard key={c.id} candidate={c} />
            ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          textAlign: 'center',
          padding: '2rem 0 1rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          lineHeight: 1.8,
        }}
      >
        <p style={{ margin: 0 }}>資料來源：{metadata.event_source}</p>
        <p style={{ margin: '0.25rem 0 0' }}>
          最後更新：{metadata.compiled_at} · 版本 {metadata.version}
        </p>
        <p style={{ margin: '0.25rem 0 0' }}>
          <Link href="/methodology" style={{ color: 'var(--gta-ochre)' }}>
            編輯方法與標準
          </Link>
        </p>
      </footer>
    </div>
  );
}
