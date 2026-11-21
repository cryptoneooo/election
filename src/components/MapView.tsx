'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  getAllPolicies,
  getAllCandidates,
  getAllPlaces,
  getPlacesWithGeometry,
} from '@/lib/data';
import { DISTRICTS, TOPIC_ICONS, getPartyCode } from '@/lib/types';
import districtGeoJSON from '@/data/districts.geojson.json';

// Compute district centers from actual GeoJSON centroids
function computeCentroid(coords: number[][][]): [number, number] {
  let totalLat = 0, totalLng = 0, count = 0;
  for (const ring of coords) {
    for (const [lng, lat] of ring) {
      totalLat += lat;
      totalLng += lng;
      count++;
    }
  }
  return [totalLat / count, totalLng / count];
}

const DISTRICT_CENTERS: Record<string, [number, number]> = {};
for (const feature of (districtGeoJSON as any).features) {
  const name = feature.properties?.name;
  if (!name) continue;
  const coords = feature.geometry.type === 'MultiPolygon'
    ? feature.geometry.coordinates.flat()
    : feature.geometry.coordinates;
  DISTRICT_CENTERS[name] = computeCentroid(coords);
}

const DISTRICT_COLORS: Record<string, string> = {
  '新店': '#e67e22',
  '深坑': '#3498db',
  '石碇': '#2ecc71',
  '坪林': '#9b59b6',
  '烏來': '#e74c3c',
};

function LeafletMap({
  districtFilter,
  onDistrictClick,
  policiesByDistrict,
}: {
  districtFilter: string | null;
  onDistrictClick: (d: string | null) => void;
  policiesByDistrict: Record<string, { length: number }>;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [24.92, 121.58],
        zoom: 11,
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: true,
        dragging: true,
      });

      // Dark tile layer for GTA aesthetic
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 16,
        }
      ).addTo(map);

      // Add district boundaries
      const geoLayer = L.geoJSON(districtGeoJSON as any, {
        style: (feature: any) => {
          const name = feature?.properties?.name || '';
          const isSelected = districtFilter === name;
          const color = DISTRICT_COLORS[name] || '#e67e22';
          return {
            color: isSelected ? '#f5f0e8' : color,
            weight: isSelected ? 3 : 2,
            opacity: 0.9,
            fillColor: color,
            fillOpacity: isSelected ? 0.35 : 0.15,
          };
        },
        onEachFeature: (feature: any, layer: any) => {
          const name = feature?.properties?.name || '';
          const count =
            (policiesByDistrict as any)[name]?.length ?? 0;

          layer.bindTooltip(
            `<div style="font-weight:800;font-size:14px;">${name}</div>
             <div style="font-size:12px;">${count} 項政見</div>`,
            {
              permanent: false,
              direction: 'center',
              className: 'district-tooltip',
            }
          );

          layer.on('click', () => {
            onDistrictClick(districtFilter === name ? null : name);
          });

          layersRef.current.push(layer);
        },
      }).addTo(map);

      // Add district labels
      for (const [name, center] of Object.entries(DISTRICT_CENTERS)) {
        const count =
          (policiesByDistrict as any)[name]?.length ?? 0;
        const icon = L.divIcon({
          className: 'district-label',
          html: `<div style="
            color: #f5f0e8;
            font-weight: 800;
            font-size: 13px;
            text-shadow: 0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.6);
            text-align: center;
            pointer-events: none;
            white-space: nowrap;
          ">
            ${name}<br/>
            <span style="font-size:10px;font-weight:400;opacity:0.8;">${count} 項政見</span>
          </div>`,
          iconSize: [80, 30],
          iconAnchor: [40, 15],
        });
        L.marker(center, { icon, interactive: false }).addTo(map);
      }

      mapInstanceRef.current = map;

      // Fit bounds to all districts
      map.fitBounds(geoLayer.getBounds().pad(0.05));
    })();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      layersRef.current = [];
    };
  }, []); // only mount once

  // Update styles when filter changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    layersRef.current.forEach((layer) => {
      const name = layer.feature?.properties?.name || '';
      const isSelected = districtFilter === name;
      const color = DISTRICT_COLORS[name] || '#e67e22';
      layer.setStyle({
        color: isSelected ? '#f5f0e8' : color,
        weight: isSelected ? 3 : 2,
        opacity: 0.9,
        fillColor: color,
        fillOpacity: isSelected ? 0.35 : 0.15,
      });
    });

    // Pan to selected district
    if (districtFilter && DISTRICT_CENTERS[districtFilter]) {
      mapInstanceRef.current.flyTo(
        DISTRICT_CENTERS[districtFilter],
        12,
        { duration: 0.5 }
      );
    } else {
      // Reset to full view
      const bounds = layersRef.current.reduce(
        (b: any, l: any) => b.extend(l.getBounds()),
        (mapInstanceRef.current as any).L
          ? new (mapInstanceRef.current as any).L.LatLngBounds()
          : null
      );
      if (layersRef.current.length > 0) {
        try {
          const L = require('leaflet');
          const allBounds = new L.LatLngBounds(
            layersRef.current.map((l: any) => l.getBounds())
          );
          mapInstanceRef.current.flyToBounds(allBounds.pad(0.05), {
            duration: 0.5,
          });
        } catch {
          // ignore
        }
      }
    }
  }, [districtFilter]);

  return (
    <div
      ref={mapRef}
      style={{
        height: '350px',
        width: '100%',
        borderRadius: 'var(--radius-md)',
        border: '2px solid var(--border)',
        overflow: 'hidden',
      }}
    />
  );
}

export default function MapView() {
  const searchParams = useSearchParams();
  const initialDistrict = searchParams.get('district');
  const [districtFilter, setDistrictFilter] = useState<string | null>(
    initialDistrict
  );
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
        <h1
          className="gta-title"
          style={{ fontSize: '1.5rem', margin: '0 0 0.75rem' }}
        >
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
              onClick={() =>
                setDistrictFilter(districtFilter === d ? null : d)
              }
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
              onClick={() =>
                setTopicFilter(topicFilter === t ? null : t)
              }
            >
              {TOPIC_ICONS[t] || '📌'} {t}
            </button>
          ))}
        </div>

        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            margin: '0',
          }}
        >
          共 {filteredPolicies.length} 項政見
          {placesWithGeo.length > 0 &&
            ` · ${placesWithGeo.length} 個地點有座標`}
        </p>
      </div>

      {/* Interactive Map */}
      <div style={{ margin: '0 1rem 1rem' }}>
        {isClient ? (
          <LeafletMap
            districtFilter={districtFilter}
            onDistrictClick={setDistrictFilter}
            policiesByDistrict={policiesByDistrict}
          />
        ) : (
          <div
            style={{
              height: '350px',
              background:
                'linear-gradient(135deg, var(--gta-charcoal) 0%, var(--gta-dark) 100%)',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
            }}
          >
            地圖載入中...
          </div>
        )}
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
                <span
                  style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: DISTRICT_COLORS[d] || '#e67e22',
                  }}
                />{' '}
                {d}
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    fontWeight: 400,
                  }}
                >
                  {dPolicies.length} 項政見
                </span>
              </h2>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {dPolicies.map((p) => {
                  const cand = candidateMap.get(p.candidate_id);
                  return (
                    <Link
                      key={p.id}
                      href={`/candidates/${p.candidate_id}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div
                        className="gta-card"
                        style={{ padding: '0.6rem 0.75rem' }}
                      >
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
                              className={`party-badge party-badge--${getPartyCode(cand.party)}`}
                              style={{
                                fontSize: '0.65rem',
                                padding: '1px 6px',
                              }}
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
