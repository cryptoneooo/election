import Link from 'next/link';
import type { Candidate } from '@/lib/types';
import { getPartyCode, getPartyShort } from '@/lib/types';
import { getPoliciesForCandidate, getFactChecksForCandidate } from '@/lib/data';

export default function CandidateCard({ candidate }: { candidate: Candidate }) {
  const isAbsent = candidate.event_attendance === 'absent';
  const policyCount = getPoliciesForCandidate(candidate.id).length;
  const checkCount = getFactChecksForCandidate(candidate.id).length;
  const partyCode = getPartyCode(candidate.party);

  return (
    <Link href={`/candidates/${candidate.id}`} style={{ textDecoration: 'none' }}>
      <div className={`gta-card ${isAbsent ? 'absent-overlay' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--gta-orange), var(--gta-ochre))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.3rem',
              color: 'var(--gta-charcoal)',
              flexShrink: 0,
              border: '2px solid var(--gta-orange-bright)',
            }}
          >
            {candidate.ballot_number}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--gta-cream)' }}>
                {candidate.name}
              </h3>
              <span className={`party-badge party-badge--${partyCode}`}>
                {getPartyShort(candidate.party)}
              </span>
              {candidate.incumbent && (
                <span style={{ fontSize: '0.7rem', color: 'var(--gta-ochre)', fontWeight: 600 }}>
                  現任
                </span>
              )}
            </div>

            <p
              style={{
                margin: '0.4rem 0 0',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {isAbsent ? '本場公辦政見發表會未出席' : candidate.position_summary || candidate.background_summary}
            </p>

            {!isAbsent && (
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>{policyCount} 項政見</span>
                <span>{checkCount} 項查核</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
