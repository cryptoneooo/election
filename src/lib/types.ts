// ===== Election Data Types (matches actual JSON) =====

export interface Candidate {
  id: string;
  ballot_number: number;
  name: string;
  party: string; // Full party name: '中國國民黨', '民主進步黨', etc.
  incumbent: boolean;
  event_attendance: 'present' | 'absent';
  event_policy_display: string | null;
  attendance_note: string;
  speech_paragraph_range: [number, number] | null;
  background_summary: string;
  background_status: string;
  position_summary: string;
  portrait: {
    original_url: string | null;
    stylized_path: string | null;
    rights_status: string;
    render_status: string;
  };
  source_ids: string[];
  bulletin?: {
    gender: string | null;
    birthdate: string | null;
    education: string[];
    experience: string[];
    source: string;
  };
}

export type VerdictKey =
  | 'supported'
  | 'partly_supported'
  | 'needs_context'
  | 'unverified'
  | 'self_reported'
  | 'transcription_issue'
  | 'source_conflict';

export interface FactCheck {
  id: string;
  candidate_id: string;
  claim: string;
  claim_origin: string;
  transcript_paragraphs: number[];
  verdict: VerdictKey;
  explanation: string;
  evidence_source_ids: string[];
  checked_at: string;
  next_evidence_needed: string;
  priority: string;
  publication_status: string;
  candidate_response: string | null;
  response_requested: boolean;
}

export interface Policy {
  id: string;
  candidate_id: string;
  title: string;
  summary: string;
  topic: string;
  districts: string[];
  geographic_scope: string;
  location_ids: string[];
  stage?: string;
  source_ids: string[];
  transcript_paragraphs: number[];
  timecode: string | null;
  budget: string | null;
  deadline: string | null;
  specificity: {
    has_named_location: boolean;
    has_action: boolean;
    has_budget: boolean;
    has_deadline: boolean;
  };
  implementation_note: string;
  fact_check_ids: string[];
  map_display: string;
  transcript_text?: string;
  bulletin_text?: string;
  source?: string; // 'speech' | 'bulletin'
}

export interface Place {
  id: string;
  name: string;
  districts: string[];
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  } | null;
  geocode_status: string;
  location_type: string;
  source_ids: string[];
  note: string;
}

export interface Source {
  id: string;
  type: string;
  title: string; // actual field name in JSON
  url: string | null;
  accessed_at: string;
  note: string;
}

export interface ElectionMetadata {
  title: string;
  version: string;
  compiled_at: string;
  timezone: string;
  election_year: number;
  district_number: number;
  districts: string[];
  event_date: string;
  event_date_confidence: string;
  event_source: string;
  scope: string;
  limitations: string[];
  original_docx_sha256: string;
}

export interface ElectionData {
  metadata: ElectionMetadata;
  verdict_labels: Record<VerdictKey, string>;
  candidates: Candidate[];
  policies: Policy[];
  places: Place[];
  fact_checks: FactCheck[];
  sources: Source[];
  coverage: unknown[];
  transcript_ledger: unknown;
}

// ===== UI Constants =====

export const DISTRICTS = ['新店', '深坑', '石碇', '坪林', '烏來'] as const;
export type District = (typeof DISTRICTS)[number];

// Map full party names to short labels and colors
export const PARTY_INFO: Record<string, { short: string; code: string; color: string }> = {
  '中國國民黨': { short: '國民黨', code: 'KMT', color: '#0047AB' },
  '民主進步黨': { short: '民進黨', code: 'DPP', color: '#1B9431' },
  '台灣民眾黨': { short: '民眾黨', code: 'TPP', color: '#28C8C8' },
  '台灣綠黨': { short: '綠黨', code: 'GP', color: '#73BE44' },
  '無黨籍': { short: '無黨籍', code: 'IND', color: '#888888' },
};

export function getPartyCode(party: string): string {
  return PARTY_INFO[party]?.code ?? 'IND';
}

export function getPartyShort(party: string): string {
  return PARTY_INFO[party]?.short ?? party;
}

export const VERDICT_CONFIG: Record<VerdictKey, { label: string; color: string; icon: string }> = {
  supported: { label: '來源支持', color: '#4CAF50', icon: '✓' },
  partly_supported: { label: '部分有據', color: '#8BC34A', icon: '◐' },
  needs_context: { label: '需補充脈絡', color: '#FF9800', icon: '⚠' },
  unverified: { label: '尚待查證', color: '#9E9E9E', icon: '?' },
  self_reported: { label: '候選人自述', color: '#78909C', icon: '☐' },
  transcription_issue: { label: '逐字稿疑似誤辨', color: '#E91E63', icon: '⚡' },
  source_conflict: { label: '來源不一致', color: '#F44336', icon: '✕' },
};

export const TOPIC_ICONS: Record<string, string> = {
  '交通': '🚦',
  '水務': '💧',
  '都市計畫': '🏗',
  '市場': '🏪',
  '教育': '📚',
  '產業文化': '🎭',
  '治安': '🛡',
  '長照高齡': '👴',
  '健康社福': '❤️',
  '動保': '🐾',
  '地方建設': '🏠',
  '數位治理': '💻',
  '基層勞動': '👷',
  '能源立場': '⚡',
  '環境': '🌳',
  '議會改革': '🏛',
  '兒少': '👶',
  '防災': '🚨',
  '坡地安全': '⛰',
};
