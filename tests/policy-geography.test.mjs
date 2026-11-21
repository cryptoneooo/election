import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const data = JSON.parse(readFileSync(new URL('../src/data/election_data.json', import.meta.url)));
const audit = JSON.parse(readFileSync(new URL('../docs/policy-district-audit.json', import.meta.url)));
const policies = new Map(data.policies.map(p => [p.id, p]));
const ledger = new Map(data.transcript_ledger.map(p => [p.paragraph, p]));

test('every policy has an audit tied to unchanged transcript evidence', () => {
  assert.equal(audit.policies.length, policies.size);
  assert.equal(new Set(audit.policies.map(p => p.policy_id)).size, policies.size);
  for (const row of audit.policies) {
    const policy = policies.get(row.policy_id);
    assert.deepEqual(policy.districts, row.after, row.policy_id);
    assert.deepEqual(policy.transcript_paragraphs, row.evidence.map(e => e.paragraph));
    for (const evidence of row.evidence) {
      assert.equal(ledger.get(evidence.paragraph).raw_text, evidence.raw_text);
      assert.ok(ledger.get(evidence.paragraph).policy_ids.includes(row.policy_id));
    }
  }
});
test('adjacent-policy names never leak into general welfare and citywide proposals', () => {
  for (const id of ['p08_02','p09_12','p03_06','p03_10','p03_11','p03_12','p03_21','p03_23','p07_05','p07_12','p07_15','p06_10','p01_01']) {
    assert.deepEqual(policies.get(id).districts, [], id);
    assert.equal(policies.get(id).map_display, 'nonspatial_policy_panel', id);
  }
});
test('named places and multi-district clauses use the correct administrative scope', () => {
  assert.deepEqual(policies.get('p05_04').districts, ['新店']); // 大坪林 != 坪林
  assert.deepEqual(policies.get('p05_05').districts, ['深坑']);
  assert.deepEqual(policies.get('p05_06').districts, ['深坑','石碇']);
  assert.deepEqual(policies.get('p05_08').districts, ['石碇','坪林','烏來']);
  assert.deepEqual(policies.get('p05_09').districts, ['石碇','坪林','烏來']);
  assert.deepEqual(policies.get('p05_14').districts, ['新店','深坑','石碇','坪林','烏來']);
});
test('coverage contains exactly policies explicitly assigned to each district', () => {
  for (const row of data.coverage) {
    const expected = data.policies.filter(p => p.candidate_id === row.candidate_id && p.districts.includes(row.district));
    assert.deepEqual(row.policy_ids, expected.map(p => p.id));
    assert.deepEqual(row.specific_policy_ids, expected.filter(p => p.location_ids.length).map(p => p.id));
  }
});
test('future proposal marker is removed without deleting policies', () => {
  assert.equal(policies.size, 124);
  for (const policy of policies.values()) assert.notEqual(policy.stage, 'future_proposal');
});
