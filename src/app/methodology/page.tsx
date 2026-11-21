import Link from 'next/link';
import { getMetadata, getVerdictCounts, getAllSources } from '@/lib/data';
import { VERDICT_CONFIG, type VerdictKey } from '@/lib/types';

export default function MethodologyPage() {
  const metadata = getMetadata();
  const verdictCounts = getVerdictCounts();
  const sources = getAllSources();

  return (
    <div className="page-container animate-in">
      <h1 className="gta-title" style={{ fontSize: '1.5rem', margin: '0 0 1rem' }}>
        編輯方法與標準
      </h1>

      {/* Overview */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="gta-subtitle" style={{ fontSize: '1rem', margin: '0 0 0.5rem' }}>
          關於這個計畫
        </h2>
        <div className="gta-card">
          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            「大文山政見地圖」整理 {metadata.election_year} 新北市議員第 {metadata.district_number} 選區（{metadata.districts.join('、')}）候選人在公辦政見發表會上的政見主張，
            並以地理位置、議題分類呈現，讓選民能從自己生活的地方出發，了解各候選人的具體政見。
          </p>
        </div>
      </section>

      {/* Scope */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="gta-subtitle" style={{ fontSize: '1rem', margin: '0 0 0.5rem' }}>
          資料範圍
        </h2>
        <div className="gta-card">
          <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            {metadata.scope}
          </p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            政見發表會日期：{metadata.event_date}（{metadata.event_date_confidence}）
          </p>
        </div>
      </section>

      {/* Limitations */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="gta-subtitle" style={{ fontSize: '1rem', margin: '0 0 0.5rem' }}>
          已知限制
        </h2>
        <div className="gta-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {metadata.limitations.map((lim, i) => (
              <p
                key={i}
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  lineHeight: 1.7,
                  color: 'var(--text-secondary)',
                  paddingLeft: '1rem',
                  position: 'relative',
                }}
              >
                <span style={{ position: 'absolute', left: 0, color: 'var(--gta-ochre)' }}>⚠</span>
                {lim}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Verdict definitions */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="gta-subtitle" style={{ fontSize: '1rem', margin: '0 0 0.5rem' }}>
          查核結果分類
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {(Object.entries(VERDICT_CONFIG) as [VerdictKey, (typeof VERDICT_CONFIG)[VerdictKey]][]).map(
            ([key, vc]) => (
              <div key={key} className="gta-card" style={{ padding: '0.6rem 0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    className="verdict-chip"
                    style={{ borderColor: vc.color, color: vc.color, background: `${vc.color}15` }}
                  >
                    {vc.icon} {vc.label}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {verdictCounts[key] ?? 0} 則
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Four states */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="gta-subtitle" style={{ fontSize: '1rem', margin: '0 0 0.5rem' }}>
          四種資料狀態
        </h2>
        <div className="gta-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            <p style={{ margin: 0 }}><strong style={{ color: 'var(--gta-cream)' }}>未收錄</strong> — 該議題尚未被本站整理記錄</p>
            <p style={{ margin: 0 }}><strong style={{ color: 'var(--gta-cream)' }}>尚未查證</strong> — 已記錄但尚未完成事實查核</p>
            <p style={{ margin: 0 }}><strong style={{ color: 'var(--gta-cream)' }}>未提出</strong> — 候選人未就此議題提出政見</p>
            <p style={{ margin: 0 }}><strong style={{ color: 'var(--gta-cream)' }}>未出席</strong> — 候選人未出席公辦政見發表會</p>
          </div>
        </div>
      </section>

      {/* Sources */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="gta-subtitle" style={{ fontSize: '1rem', margin: '0 0 0.75rem' }}>
          引用來源（共 {sources.length} 則）
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {sources.map((src) => (
            <div key={src.id} className="gta-card" style={{ padding: '0.5rem 0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0, minWidth: '2.5rem' }}>
                  [{src.id}]
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {src.url ? (
                      <a href={src.url} target="_blank" rel="noopener noreferrer">
                        {src.title}
                      </a>
                    ) : (
                      src.title
                    )}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {src.type} · {src.accessed_at}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Meta */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          padding: '1rem 0',
          lineHeight: 1.8,
        }}
      >
        <p style={{ margin: 0 }}>資料版本：{metadata.version}</p>
        <p style={{ margin: 0 }}>編譯時間：{metadata.compiled_at}</p>
      </div>
    </div>
  );
}
