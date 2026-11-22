import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getCandidate,
  getAllCandidates,
  getPoliciesForCandidate,
  getFactChecksForCandidate,
} from '@/lib/data';
import { VERDICT_CONFIG, TOPIC_ICONS, getPartyCode, getPartyShort } from '@/lib/types';
import TranscriptBlock from '@/components/TranscriptBlock';

export function generateStaticParams() {
  return getAllCandidates().map((c) => ({ id: c.id }));
}

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = getCandidate(id);
  if (!candidate) notFound();

  const policies = getPoliciesForCandidate(id);
  const factChecks = getFactChecksForCandidate(id);
  const isAbsent = candidate.event_attendance === 'absent';
  const partyCode = getPartyCode(candidate.party);

  // Group policies by topic
  const policyByTopic: Record<string, typeof policies> = {};
  for (const p of policies) {
    if (!policyByTopic[p.topic]) policyByTopic[p.topic] = [];
    policyByTopic[p.topic].push(p);
  }

  return (
    <div className="page-container animate-in">
      <Link
        href="/candidates"
        style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'inline-block', marginBottom: '1rem' }}
      >
        ← 返回候選人列表
      </Link>

      {/* Header */}
      <div
        className={isAbsent ? 'absent-overlay' : ''}
        style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--gta-orange), var(--gta-ochre))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1.8rem',
            color: 'var(--gta-charcoal)',
            flexShrink: 0,
            border: '3px solid var(--gta-orange-bright)',
          }}
        >
          {candidate.ballot_number}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900 }}>{candidate.name}</h1>
            <span className={`party-badge party-badge--${partyCode}`}>
              {getPartyShort(candidate.party)}
            </span>
            {candidate.incumbent && (
              <span style={{ fontSize: '0.8rem', color: 'var(--gta-ochre)', fontWeight: 600 }}>
                現任
              </span>
            )}
          </div>
          {candidate.position_summary && (
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--gta-ochre)' }}>
              {candidate.position_summary}
            </p>
          )}
        </div>
      </div>

      {/* Background */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="gta-subtitle" style={{ fontSize: '1rem', margin: '0 0 0.5rem' }}>
          候選人背景
        </h2>
        <div className="gta-card">
          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            {isAbsent ? '本場公辦政見發表會未出席，無相關政見資料收錄。' : candidate.background_summary}
          </p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {candidate.background_status}
          </p>
        </div>
      </section>

      {/* Bulletin - 選舉公報 */}
      {candidate.bulletin && (candidate.bulletin.education?.length > 0 || candidate.bulletin.experience?.length > 0) && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 className="gta-subtitle" style={{ fontSize: '1rem', margin: '0 0 0.5rem' }}>
            📋 選舉公報
          </h2>
          <div className="gta-card" style={{ padding: '0.75rem 1rem' }}>
            {candidate.bulletin.birthdate && (
              <p style={{ margin: '0 0 0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--gta-ochre)', fontWeight: 600 }}>出生年月日：</span>
                {candidate.bulletin.birthdate}
              </p>
            )}
            {candidate.bulletin.education && candidate.bulletin.education.length > 0 && (
              <div style={{ marginBottom: '0.5rem' }}>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: 'var(--gta-ochre)', fontWeight: 600 }}>
                  學歷
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  {candidate.bulletin.education.map((e: string, i: number) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
            {candidate.bulletin.experience && candidate.bulletin.experience.length > 0 && (
              <div>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: 'var(--gta-ochre)', fontWeight: 600 }}>
                  經歷
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  {candidate.bulletin.experience.map((e: string, i: number) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              資料來源：{candidate.bulletin.source || '選舉公報'}
            </p>
          </div>
        </section>
      )}

      {isAbsent ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
          }}
        >
          <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>無</p>
          <p>{candidate.attendance_note || '此候選人未出席公辦政見發表會，故無政見資料。'}</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="gta-card" style={{ flex: 1, textAlign: 'center', padding: '0.75rem' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--gta-orange)' }}>
                {policies.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>項政見</div>
            </div>
            <div className="gta-card" style={{ flex: 1, textAlign: 'center', padding: '0.75rem' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--gta-cyan)' }}>
                {factChecks.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>則查核</div>
            </div>
            <div className="gta-card" style={{ flex: 1, textAlign: 'center', padding: '0.75rem' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--gta-olive-light)' }}>
                {Object.keys(policyByTopic).length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>個議題</div>
            </div>
          </div>

          <hr className="gta-divider" />

          {/* Policies by topic */}
          <section style={{ marginBottom: '1.5rem' }}>
            <h2 className="gta-subtitle" style={{ fontSize: '1rem', margin: '0 0 0.75rem' }}>
              政見整理
            </h2>
            {Object.entries(policyByTopic).map(([topic, pols]) => (
              <div key={topic} style={{ marginBottom: '1.25rem' }}>
                <h3
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: 'var(--gta-ochre)',
                    margin: '0 0 0.5rem',
                  }}
                >
                  {TOPIC_ICONS[topic] || '📌'} {topic}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {pols.map((p) => (
                    <div key={p.id} className="gta-card" style={{ padding: '0.75rem 1rem' }}>
                      <h4
                        style={{
                          margin: '0 0 0.3rem',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          color: 'var(--gta-cream)',
                        }}
                      >
                        {p.title}
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.7,
                        }}
                      >
                        {p.summary}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          flexWrap: 'wrap',
                          marginTop: '0.5rem',
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {p.districts.map((d) => (
                          <span key={d}>📍 {d}</span>
                        ))}
                        {p.stage && <span>· {p.stage}</span>}
                      </div>
                      {p.transcript_text && (
                        <TranscriptBlock text={p.transcript_text} />
                      )}
                      {p.fact_check_ids.length > 0 && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          {p.fact_check_ids.map((fcId) => {
                            const fc = factChecks.find((f) => f.id === fcId);
                            if (!fc) return null;
                            const vc = VERDICT_CONFIG[fc.verdict];
                            return (
                              <Link
                                key={fcId}
                                href={`/checks/${fcId}`}
                                className="verdict-chip"
                                style={{
                                  borderColor: vc.color,
                                  color: vc.color,
                                  background: `${vc.color}15`,
                                  textDecoration: 'none',
                                  fontSize: '0.75rem',
                                }}
                              >
                                {vc.icon} {vc.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <hr className="gta-divider" />

          {/* Fact checks */}
          <section>
            <h2 className="gta-subtitle" style={{ fontSize: '1rem', margin: '0 0 0.75rem' }}>
              事實查核
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {factChecks.map((fc) => {
                const vc = VERDICT_CONFIG[fc.verdict];
                return (
                  <Link key={fc.id} href={`/checks/${fc.id}`} style={{ textDecoration: 'none' }}>
                    <div className="gta-card" style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span
                          className="verdict-chip"
                          style={{
                            borderColor: vc.color,
                            color: vc.color,
                            background: `${vc.color}15`,
                            flexShrink: 0,
                          }}
                        >
                          {vc.icon} {vc.label}
                        </span>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                          {fc.claim}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
