import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeProof, decodeProof, quotaAnnotationsOnly, verifyCompletedJob } from './ci-log-proof.mjs';
const identity = { repository: 'bitcoinuniverseio/atomicals-and-arc-20', job: 'site', role: 'site-built-evidence', sourceSha: 'a'.repeat(40), runId: '123', attempt: '2' };
test('bounded authenticated log transport round trips and accepts timestamped GitHub lines', () => {
  const bytes = Buffer.from(JSON.stringify({ evidence: 'safe'.repeat(30000) })); const text = encodeProof(bytes, identity);
  assert.deepEqual(decodeProof(text, identity), bytes);
  assert.deepEqual(decodeProof(text.split('\n').map(line => '2026-10-20T13:00:00.0000000Z ' + line).join('\n'), identity), bytes);
});
test('wrong revision, attempt, repository, missing/truncated/duplicate chunks fail closed', () => {
  const text = encodeProof(Buffer.from('sanitized-report'), identity);
  for (const change of [{sourceSha: 'b'.repeat(40)}, {attempt: '3'}, {repository: 'foreign/repo'}])
    assert.throws(() => decodeProof(text, {...identity, ...change}));
  const lines = text.split('\n');
  for (const altered of [lines.slice(1).join('\n'), lines.slice(0,-1).join('\n'), [...lines.slice(0,2),lines[1],lines[2]].join('\n'), text.replace('sanitized', 'changed') + '\nUNIVERSE_CI_PROOF_V1 {}'])
    assert.throws(() => decodeProof(altered, identity));
  assert.throws(() => encodeProof(Buffer.alloc(2 * 1024 * 1024 + 1), identity));
  assert.throws(() => decodeProof(text.replace(/"sha256":"[0-9a-f]+"/, '"sha256":"' + '0'.repeat(64) + '"'), identity));
});
test('only exact single quota annotation can authorize transport fallback', () => {
  const quota = {annotation_level: 'failure', message: 'Failed to CreateArtifact: Artifact storage quota has been hit. Unable to upload any new artifacts. Usage is recalculated every 6-12 hours.'};
  assert.equal(quotaAnnotationsOnly([quota]), true);
  for (const annotations of [[], [quota, quota], [{...quota,message:'Network failed'}], [quota,{...quota,message:'Tests failed'}]])
    assert.equal(quotaAnnotationsOnly(annotations), false);
});

test('completed producer must match exact run, attempt, source and all mandatory check steps', () => {
  const env = {GITHUB_RUN_ID:'123',GITHUB_RUN_ATTEMPT:'2',PROOF_HEAD_SHA:'b'.repeat(40)};
  const names = ['Type check the site', 'Build the site and publish it to the repository root',
    'Prove the build leaves the repository clean', 'Check links, anchors, compatibility routes, and generated artefacts',
    'Test the documentation MCP server against the built artefacts', 'Check accessibility invariants in the built HTML',
    'Check performance budgets against the built assets', 'Preserve site evidence in authenticated job logs'];
  const job = {status:'completed',conclusion:'success',head_sha:env.PROOF_HEAD_SHA,run_id:123,run_attempt:2,
    steps:names.map(name=>({name,conclusion:'success'}))};
  verifyCompletedJob(job,env);
  for (const change of [{status:'in_progress'},{conclusion:'failure'},{head_sha:'c'.repeat(40)},
    {run_id:124},{run_attempt:1},{steps:job.steps.slice(1)},
    {steps:job.steps.map((step,i)=>i===0?{...step,conclusion:'skipped'}:step)}])
    assert.throws(()=>verifyCompletedJob({...job,...change},env));
});
