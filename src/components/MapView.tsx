'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  getAllPolicies,
  getAllCandidates,
  getAllPlaces,
  getPlacesWithGeometry,
  getPoliciesForDistrict,
} from '@/lib/data';
import { DISTRICTS, TOPIC_ICONS, getPartyCode } from '@/lib/types';

// District approximate centers for map view
const DISTRICT_CENTERS: Record<string, [number, number]> = {
  '新店': [24.9677, 121.5419],
  '深坑': [25.0025, 121.6155],
  '石碇': [24.9916, 121.6587],
  '坪林': [24.9372, 121.7111],
  '烏來': [24.8654, 121.5505],
};

export default function MapView() {
  const searchParams = useSearchParams();
  const initialDistrict = searchParams.get('district');
  const [districtFilter, setDistrictFilter] = useState<string | null>(initialDistrict);
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const policies = getAllPolicies();
  const candidates = getAllCandidates();
  const placesWithGeo = getPlacesWithGeometry();
  const candidateMap = new Map(candidates.map((c) => [c.id, c]));

  const topics = useMemo(() => {
    const t = new Set(policies.map((p) => p.topic));
    return Array.from(t).sort();
  }, [policies]);

  const filteredPolicies = useMemo(() => {
    return policies
      .filter((p) => !districtFilter || p.districts.includes(districtFilter))
      .filter((p) => !topicFilter || p.topic === topicFilter);
  }, [policies, districtFilter, topicFilter]);

  // Group policies by district
  const policiesByDistrict = useMemo(() => {
    const map: Record<string, typeof policies> = {};
    for (const d of DISTRICTS) {
      map[d] = filteredPolicies.filter((p) => p.districts.includes(d));
    }
    return map;
  }, [filteredPolicies]);

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="page-container" style={{ paddingBottom: '0.5rem' }}>
        <h1 className="gta-title" style={{ fontSize: '1.5rem', margin: '0 0 0.75rem' }}>
          政見地圖
        </h1>

        {/* District filter */}
        <div className="chip-scroll" style={{ marginBottom: '0.5rem' }}>
          <button
            className={`filter-chip ${!districtFilter ? 'filter-chip--active' : ''}`}
            onClick={() => setDistrictFilter(null)}
          >
            全部行政區
          </button>
          {DISTRICTS.map((d) => (
            <button
              key={d}
              className={`filter-chip ${districtFilter === d ? 'filter-chip--active' : ''}`}
              onClick={() => setDistrictFilter(districtFilter === d ? null : d)}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Topic filter */}
        <div className="chip-scroll" style={{ marginBottom: '0.5rem' }}>
          <button
            className={`filter-chip ${!topicFilter ? 'filter-chip--active' : ''}`}
            onClick={() => setTopicFilter(null)}
          >
            全部議題
          </button>
          {topics.map((t) => (
            <button
              key={t}
              className={`filter-chip ${topicFilter === t ? 'filter-chip--active' : ''}`}
              onClick={() => setTopicFilter(topicFilter === t ? null : t)}
            >
              {TOPIC_ICONS[t] || '📌'} {t}
            </button>
          ))}
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0' }}>
          共 {filteredPolicies.length} 項政見
          {placesWithGeo.length > 0 && ` · ${placesWithGeo.length} 個地點有座標`}
        </p>
      </div>

      {/* Map placeholder - real Leaflet requires browser-only rendering */}
      <div
        style={{
          height: '300px',
          background: 'linear-gradient(135deg, var(--gta-charcoal) 0%, var(--gta-dark) 100%)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          margin: '0 1rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* District grid visualization */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            padding: '1rem',
            width: '100%',
            maxWidth: '400px',
          }}
        >
          {DISTRICTS.map((d) => {
            const count = policiesByDistrict[d]?.length ?? 0;
            const isSelected = districtFilter === d;
            return (
              <button
                key={d}
                onClick={() => setDistrictFilter(isSelected ? null : d)}
                style={{
                  background: isSelected
                    ? 'rgba(230,126,34,0.3)'
                    : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${isSelected ? 'var(--gta-orange)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 0.5rem',
                  color: isSelected ? 'var(--gta-orange)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{d}</div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                  {count} 項政見
                </div>
              </button>
            );
          })}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '0.5rem',
            right: '0.75rem',
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
          }}
        >
          互動式地圖開發中 · 目前僅 {placesWithGeo.length} 個地點有座標
        </div>
      </div>

      {/* Policy list by district */}
      <div className="page-container" style={{ paddingTop: 0 }}>
        {(districtFilter ? [districtFilter] : [...DISTRICTS]).map((d) => {
          const dPolicies = policiesByDistrict[d];
          if (!dPolicies || dPolicies.length === 0) return null;
          return (
            <section key={d} style={{ marginBottom: '1.5rem' }}>
              <h2
                className="gta-subtitle"
                style={{
                  fontSize: '1rem',
                  margin: '0 0 0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                📍 {d}
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                  {dPolicies.length} 項政見
                </span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {dPolicies.map((p) => {
                  const cand = candidateMap.get(p.candidate_id);
                  return (
                    <Link
                      key={p.id}
                      href={`/candidates/${p.candidate_id}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div className="gta-card" style={{ padding: '0.6rem 0.75rem' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.3rem',
                            flexWrap: 'wrap',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                            }}
                          >
                            {TOPIC_ICONS[p.topic] || '📌'} {p.topic}
                          </span>
                          {cand && (
                            <span
                              className={`party-badge party-badge--${cand.party}`}
                              style={{ fontSize: '0.65rem', padding: '1px 6px' }}
                            >
                              {cand.ballot_number} {cand.name}
                            </span>
                          )}
                        </div>
                        <h4
                          style={{
                            margin: '0 0 0.2rem',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: 'var(--gta-cream)',
                          }}
                        >
                          {p.title}
                        </h4>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.6,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {p.summary}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
