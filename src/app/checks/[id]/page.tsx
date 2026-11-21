import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getFactCheck,
  getAllFactChecks,
  getCandidate,
  getSource,
} from '@/lib/data';
import { VERDICT_CONFIG, getPartyShort } from '@/lib/types';

export function generateStaticParams() {
  return getAllFactChecks().map((fc) => ({ id: fc.id }));
}

export default async function FactCheckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fc = getFactCheck(id);
  if (!fc) notFound();

  const candidate = getCandidate(fc.candidate_id);
  const vc = VERDICT_CONFIG[fc.verdict];
  const evidenceSources = fc.evidence_source_ids
    .map((sid) => getSource(sid))
    .filter(Boolean);

  return (
    <div className="page-container animate-in">
      <Link
        href="/checks"
        style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'inline-block', marginBottom: '1rem' }}
      >
        ← 返回查核列表
      </Link>

      {/* Verdict badge */}
      <div style={{ marginBottom: '1rem' }}>
        <span
          className="verdict-chip"
          style={{
            borderColor: vc.color,
            color: vc.color,
            background: `${vc.color}15`,
            fontSize: '0.9rem',
            padding: '4px 14px',
          }}
        >
          {vc.icon} {vc.label}
        </span>
      </div>

      {/* Candidate info */}
      {candidate && (
        <Link
          href={`/candidates/${candidate.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            marginBottom: '1rem',
            textDecoration: 'none',
          }}
        >
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--gta-orange)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.8rem',
              color: 'var(--gta-charcoal)',
            }}
          >
            {candidate.ballot_number}
          </span>
          {candidate.name} · {getPartyShort(candidate.party)}
        </Link>
      )}

      {/* Claim */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="gta-subtitle" style={{ fontSize: '0.85rem', margin: '0 0 0.5rem' }}>
          候選人主張
        </h2>
        <div className="gta-card">
          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-primary)' }}>
            {fc.claim}
          </p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            來源：{fc.claim_origin}
          </p>
        </div>
      </section>

      {/* Explanation */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="gta-subtitle" style={{ fontSize: '0.85rem', margin: '0 0 0.5rem' }}>
          查核說明
        </h2>
        <div className="gta-card">
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-line',
            }}
          >
            {fc.explanation}
          </p>
        </div>
      </section>

      {/* Evidence sources */}
      {evidenceSources.length > 0 && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 className="gta-subtitle" style={{ fontSize: '0.85rem', margin: '0 0 0.5rem' }}>
            引用來源
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {evidenceSources.map((src) =>
              src ? (
                <div key={src.id} className="gta-card" style={{ padding: '0.6rem 0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    [{src.id}] {src.type}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {src.url ? (
                      <a href={src.url} target="_blank" rel="noopener noreferrer">
                        {src.title}
                      </a>
                    ) : (
                      src.title
                    )}
                  </div>
                  {src.note && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {src.note}
                    </div>
                  )}
                </div>
              ) : null
            )}
          </div>
        </section>
      )}

      {/* Candidate response */}
      {fc.candidate_response && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 className="gta-subtitle" style={{ fontSize: '0.85rem', margin: '0 0 0.5rem' }}>
            候選人回應
          </h2>
          <div className="gta-card">
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {fc.candidate_response}
            </p>
          </div>
        </section>
      )}

      {/* Next evidence needed */}
      {fc.next_evidence_needed && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 className="gta-subtitle" style={{ fontSize: '0.85rem', margin: '0 0 0.5rem' }}>
            待補充資料
          </h2>
          <div className="gta-card" style={{ borderColor: 'var(--gta-ochre)' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gta-ochre)', lineHeight: 1.7 }}>
              {fc.next_evidence_needed}
            </p>
          </div>
        </section>
      )}

      {/* Meta */}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
        <p style={{ margin: 0 }}>查核時間：{fc.checked_at}</p>
        <p style={{ margin: 0 }}>狀態：{fc.publication_status}</p>
        {fc.response_requested && <p style={{ margin: 0 }}>⚠ 已向候選人索取回應</p>}
      </div>
    </div>
  );
}
