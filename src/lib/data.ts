import rawData from '@/data/election_data.json';
import type {
  ElectionData,
  Candidate,
  Policy,
  FactCheck,
  Place,
  Source,
  District,
  VerdictKey,
  ElectionMetadata,
} from './types';

const data = rawData as unknown as ElectionData;

// ===== Candidates =====
export function getAllCandidates(): Candidate[] {
  return data.candidates;
}

export function getCandidate(id: string): Candidate | undefined {
  return data.candidates.find((c) => c.id === id);
}

export function getCandidateByNumber(num: number): Candidate | undefined {
  return data.candidates.find((c) => c.ballot_number === num);
}

// ===== Policies =====
export function getAllPolicies(): Policy[] {
  return data.policies;
}

export function getPoliciesForCandidate(candidateId: string): Policy[] {
  return data.policies.filter((p) => p.candidate_id === candidateId);
}

export function getPoliciesForDistrict(district: District): Policy[] {
  return data.policies.filter((p) => p.districts.includes(district));
}

export function getPoliciesByTopic(topic: string): Policy[] {
  return data.policies.filter((p) => p.topic === topic);
}

export function getAllTopics(): string[] {
  const topics = new Set(data.policies.map((p) => p.topic));
  return Array.from(topics).sort();
}

// ===== Fact Checks =====
export function getAllFactChecks(): FactCheck[] {
  return data.fact_checks;
}

export function getFactChecksForCandidate(candidateId: string): FactCheck[] {
  return data.fact_checks.filter((fc) => fc.candidate_id === candidateId);
}

export function getFactCheck(id: string): FactCheck | undefined {
  return data.fact_checks.find((fc) => fc.id === id);
}

export function getFactChecksForPolicy(policyId: string): FactCheck[] {
  const policy = data.policies.find((p) => p.id === policyId);
  if (!policy) return [];
  return data.fact_checks.filter((fc) => policy.fact_check_ids.includes(fc.id));
}

// ===== Places =====
export function getAllPlaces(): Place[] {
  return data.places;
}

export function getPlace(id: string): Place | undefined {
  return data.places.find((p) => p.id === id);
}

export function getPlacesWithGeometry(): Place[] {
  return data.places.filter((p) => p.geometry !== null);
}

export function getPlacesForDistrict(district: District): Place[] {
  return data.places.filter((p) => p.districts.includes(district));
}

// ===== Sources =====
export function getSource(id: string): Source | undefined {
  return data.sources.find((s) => s.id === id);
}

export function getAllSources(): Source[] {
  return data.sources;
}

// ===== Metadata =====
export function getMetadata(): ElectionMetadata {
  return data.metadata;
}

export function getVerdictLabels(): Record<VerdictKey, string> {
  return data.verdict_labels;
}

// ===== Aggregations =====

/** Get policy_ids for a candidate by scanning policies */
export function getPolicyIdsForCandidate(candidateId: string): string[] {
  return data.policies.filter((p) => p.candidate_id === candidateId).map((p) => p.id);
}

/** Get fact_check_ids for a candidate by scanning fact_checks */
export function getFactCheckIdsForCandidate(candidateId: string): string[] {
  return data.fact_checks.filter((fc) => fc.candidate_id === candidateId).map((fc) => fc.id);
}

export function getVerdictCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const fc of data.fact_checks) {
    counts[fc.verdict] = (counts[fc.verdict] || 0) + 1;
  }
  return counts;
}

export function getCandidateVerdictCounts(candidateId: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const fc of data.fact_checks.filter((f) => f.candidate_id === candidateId)) {
    counts[fc.verdict] = (counts[fc.verdict] || 0) + 1;
  }
  return counts;
}

export function getDistrictPolicyCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of data.policies) {
    for (const d of p.districts) {
      counts[d] = (counts[d] || 0) + 1;
    }
  }
  return counts;
}
