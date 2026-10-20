import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
const MAX = 2 * 1024 * 1024;
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const requireThat = (condition, code) => { if (!condition) throw new Error(code); };
const PREFIX = 'UNIVERSE_CI_PROOF_V1 ';
export function encodeProof(bytes, identity) {
  requireThat(Buffer.isBuffer(bytes) && bytes.length > 0 && bytes.length <= MAX, 'PROOF_SIZE');
  requireThat(identity.repository === 'bitcoinuniverseio/atomicals-and-arc-20' && identity.role === 'site-built-evidence'
    && /^[0-9a-f]{40}$/.test(identity.sourceSha) && /^[1-9][0-9]*$/.test(String(identity.runId))
    && /^[1-9][0-9]*$/.test(String(identity.attempt)) && identity.job === 'site', 'PROOF_IDENTITY');
  const text = gzipSync(bytes).toString('base64');
  requireThat(text.length <= MAX, 'COMPRESSED_PROOF_SIZE');
  const chunks = text.match(/.{1,4096}/g);
  return [PREFIX + JSON.stringify({ type: 'manifest', ...identity, bytes: bytes.length, sha256: sha(bytes), chunks: chunks.length }),
    ...chunks.map((data, index) => PREFIX + JSON.stringify({ type: 'chunk', index, data })),
    PREFIX + JSON.stringify({ type: 'end', sha256: sha(bytes) })].join('\n');
}
export function decodeProof(log, expected) {
  requireThat(typeof log === 'string' && Buffer.byteLength(log) <= 16 * 1024 * 1024, 'LOG_SIZE');
  const records = log.split(/\r?\n/).filter(line => line.includes(PREFIX)).map(line => {
    const match = line.match(/^(?:[0-9TZ:.+-]+ )?UNIVERSE_CI_PROOF_V1 (\{.*\})$/);
    requireThat(match, 'PROOF_RECORD'); return JSON.parse(match[1]);
  });
  requireThat(records.length >= 3 && records[0].type === 'manifest' && records.at(-1).type === 'end', 'PROOF_BOUNDARIES');
  const manifest = records[0];
  for (const [key, value] of Object.entries(expected)) requireThat(manifest[key] === value, 'PROOF_IDENTITY');
  requireThat(Number.isSafeInteger(manifest.bytes) && manifest.bytes > 0 && manifest.bytes <= MAX
    && Number.isSafeInteger(manifest.chunks) && manifest.chunks > 0 && manifest.chunks <= 512
    && records.length === manifest.chunks + 2 && /^[0-9a-f]{64}$/.test(manifest.sha256), 'PROOF_MANIFEST');
  const chunks = records.slice(1, -1).map((record, index) => {
    requireThat(record.type === 'chunk' && record.index === index && typeof record.data === 'string'
      && record.data.length <= 4096 && /^[A-Za-z0-9+/]+={0,2}$/.test(record.data), 'PROOF_CHUNK');
    return record.data;
  });
  const bytes = gunzipSync(Buffer.from(chunks.join(''), 'base64'), { maxOutputLength: MAX });
  requireThat(bytes.length === manifest.bytes && sha(bytes) === manifest.sha256
    && records.at(-1).sha256 === manifest.sha256, 'PROOF_DIGEST');
  return bytes;
}
export function quotaAnnotationsOnly(annotations) {
  const failures = annotations.filter(item => item.annotation_level === 'failure');
  return failures.length === 1 && /^Failed to CreateArtifact: Artifact storage quota has been hit\. Unable to upload any new artifacts\. Usage is recalculated every 6-12 hours\.\s*(?:More info on storage limits: https:\/\/docs\.github\.com\/[^\s]+)?\s*$/.test(failures[0].message);
}

const UPLOAD_PREFIX = 'UNIVERSE_CI_UPLOAD_V1 ';
const UPLOAD_ROLES = ['site-built-evidence'];
export function encodeUploadOutcome(bytes, jobId, role, outcome, identity) {
  requireThat(UPLOAD_ROLES.includes(role) && ['success', 'failure'].includes(outcome)
    && Number.isSafeInteger(jobId) && jobId > 0, 'UPLOAD_OUTCOME');
  // The same strict source identity and size rules apply to the report and its upload receipt.
  encodeProof(bytes, identity);
  return UPLOAD_PREFIX + JSON.stringify({...identity, jobId, role, outcome, reportSha256: sha(bytes)});
}
export function decodeUploadOutcomes(log, bytes, job, identity) {
  const records = log.split(/\r?\n/).filter(line => line.includes(UPLOAD_PREFIX)).map(line => {
    const match = line.match(/^(?:[0-9TZ:.+-]+ )?UNIVERSE_CI_UPLOAD_V1 (\{.*\})$/);
    requireThat(match, 'UPLOAD_RECORD'); return JSON.parse(match[1]);
  });
  requireThat(records.length === UPLOAD_ROLES.length, 'EXACT_UPLOAD_RECEIPTS');
  for (const role of UPLOAD_ROLES) {
    const matching = records.filter(record => record.role === role);
    requireThat(matching.length === 1, 'EXACT_UPLOAD_ROLE'); const record = matching[0];
    for (const [key, value] of Object.entries(identity)) {
      if (key !== 'role') requireThat(record[key] === value, 'UPLOAD_IDENTITY');
    }
    requireThat(record.jobId === job.id && record.reportSha256 === sha(bytes)
      && ['success', 'failure'].includes(record.outcome), 'UPLOAD_BINDING');
  }
  return { mandatoryFailed: records.find(record => record.role === UPLOAD_ROLES[0]).outcome === 'failure',
    failedUploads: records.filter(record => record.outcome === 'failure').length };
}
export async function verifyUploadResults(load, result, pause) {
  // Ordinary report retention preserves the existing optional binary soft gate.
  // Only report fallback requires strict accounting for every failed upload.
  if (result.mandatoryFailed) await verifyUploadAnnotations(load, result.failedUploads, pause);
}
export async function verifyUploadAnnotations(load, expectedFailures, pause = ms => new Promise(resolve => setTimeout(resolve, ms))) {
  requireThat(Number.isSafeInteger(expectedFailures) && expectedFailures >= 0
    && expectedFailures <= UPLOAD_ROLES.length, 'UPLOAD_FAILURE_COUNT');
  // Completed checks can still take a short time to publish their final annotations.
  for (let attempt = 0; attempt < 10; attempt++) {
    const annotations = await load();
    requireThat(Array.isArray(annotations) && annotations.length < 100, 'BOUNDED_ANNOTATIONS');
    const failures = annotations.filter(item => item.annotation_level === 'failure');
    requireThat(failures.length <= expectedFailures && failures.every(item => quotaAnnotationsOnly([item])), 'ONLY_QUOTA_FAILURE_ALLOWED');
    if (failures.length === expectedFailures) return;
    if (attempt < 9) await pause(2000);
  }
  throw new Error('COMPLETED_QUOTA_ANNOTATIONS_REQUIRED');
}

export function verifyCompletedJob(job, env) {
    requireThat(job.status === 'completed' && job.conclusion === 'success' && job.head_sha === env.PROOF_HEAD_SHA
      && String(job.run_id) === env.GITHUB_RUN_ID && String(job.run_attempt) === env.GITHUB_RUN_ATTEMPT, 'COMPLETED_EXACT_PRODUCER');
    for (const name of ['Type check the site', 'Build the site and publish it to the repository root',
      'Prove the build leaves the repository clean', 'Check links, anchors, compatibility routes, and generated artefacts',
      'Test the documentation MCP server against the built artefacts', 'Check accessibility invariants in the built HTML',
      'Check performance budgets against the built assets', 'Preserve site evidence in authenticated job logs',
      'Prove search reproducibility across fresh processes and input orders', 'Record site evidence upload outcome']) {
      const steps = job.steps.filter(step => step.name === name);
      requireThat(steps.length === 1 && steps[0].conclusion === 'success', 'COMPLETED_PRODUCER_CHECKS');
    }
}
async function api(path) {
  requireThat(process.env.GITHUB_TOKEN && !path.includes('..'), 'READ_TOKEN_REQUIRED');
  const response = await fetch('https://api.github.com/' + path, { headers: { Authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
    Accept: 'application/vnd.github+json' }, redirect: 'error', signal: AbortSignal.timeout(15000) });
  requireThat(response.ok, 'AUTHENTICATED_READBACK_REQUIRED');
  const text = await response.text(); requireThat(Buffer.byteLength(text) <= 4 * 1024 * 1024, 'READBACK_SIZE'); return JSON.parse(text);
}
async function currentJob() {
  const env = process.env;
  requireThat(env.GITHUB_REPOSITORY === 'bitcoinuniverseio/atomicals-and-arc-20' && env.GITHUB_JOB === 'site'
    && /^[1-9][0-9]*$/.test(env.GITHUB_RUN_ID) && /^[1-9][0-9]*$/.test(env.GITHUB_RUN_ATTEMPT), 'JOB_IDENTITY');
  const payload = await api(`repos/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}/attempts/${env.GITHUB_RUN_ATTEMPT}/jobs?per_page=100`);
  requireThat(payload.total_count <= 100 && payload.jobs.length === payload.total_count, 'BOUNDED_JOB_LIST');
  const jobs = payload.jobs.filter(job => job.name === 'Site build, links, and artefacts' && job.runner_name === env.RUNNER_NAME && job.status === 'in_progress');
  requireThat(jobs.length === 1, 'EXACT_ACTIVE_JOB_REQUIRED'); return jobs[0];
}
async function main() {
  const [command, file] = process.argv.slice(2); const env = process.env;
  if (command === 'emit') {
    // This manifest contains only public generated file names and byte hashes, never environment data.
    const report = {schemaVersion: 'committed-site-build-evidence-v1', sourceSha: env.GITHUB_SHA, files: []};
    const published = JSON.parse(readFileSync('.site-manifest.json')).files;
    requireThat(Array.isArray(published) && published.length <= 5000, 'SITE_MANIFEST_SIZE');
    for (const path of published) {
      requireThat(typeof path === 'string' && /^[a-zA-Z0-9_./-]+$/.test(path) && !path.split('/').includes('..'), 'SITE_PATH');
      const built = readFileSync('site/dist/' + path); const committed = readFileSync(path);
      requireThat(built.equals(committed), 'BUILT_COMMITTED_BYTES_REQUIRED');
      report.files.push({path, bytes: built.length, sha256: sha(built)});
    }
    const bytes = Buffer.from(JSON.stringify(report)); writeFileSync(file, bytes, {flag: 'wx'});
    const sourceSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    requireThat(sourceSha === env.GITHUB_SHA, 'EXACT_CHECKOUT_REQUIRED');
    console.log(encodeProof(bytes, { repository: env.GITHUB_REPOSITORY, job: env.GITHUB_JOB, role: 'site-built-evidence',
      sourceSha, runId: env.GITHUB_RUN_ID, attempt: env.GITHUB_RUN_ATTEMPT }));
  } else if (command === 'upload-outcome') {
    const job = await currentJob();
    const bytes = readFileSync(file);
    const identity = { repository: env.GITHUB_REPOSITORY, job: env.GITHUB_JOB, role: 'site-built-evidence',
      sourceSha: env.GITHUB_SHA, runId: env.GITHUB_RUN_ID, attempt: env.GITHUB_RUN_ATTEMPT };
    requireThat(decodeProof(encodeProof(bytes, identity), identity).equals(bytes), 'PROOF_ROUNDTRIP');
    console.log(encodeUploadOutcome(bytes, job.id, process.argv[4], process.argv[5], identity));
  } else if (command === 'verify-completed') {
    requireThat(env.GITHUB_REPOSITORY === 'bitcoinuniverseio/atomicals-and-arc-20'
      && /^[1-9][0-9]*$/.test(env.GITHUB_RUN_ID) && /^[1-9][0-9]*$/.test(env.GITHUB_RUN_ATTEMPT)
      && /^[0-9a-f]{40}$/.test(env.GITHUB_SHA) && /^[0-9a-f]{40}$/.test(env.PROOF_HEAD_SHA), 'CONSUMER_IDENTITY');
    const payload = await api(`repos/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}/attempts/${env.GITHUB_RUN_ATTEMPT}/jobs?per_page=100`);
    requireThat(payload.total_count <= 100 && payload.jobs.length === payload.total_count, 'BOUNDED_JOB_LIST');
    const jobs = payload.jobs.filter(job => job.name === 'Site build, links, and artefacts');
    requireThat(jobs.length === 1, 'ONE_PRODUCER_JOB'); const job = jobs[0];
    verifyCompletedJob(job, env);
    let url = `https://api.github.com/repos/${env.GITHUB_REPOSITORY}/actions/jobs/${job.id}/logs`;
    let response;
    for (let redirects = 0; redirects <= 3; redirects++) {
      response = await fetch(url, { redirect: 'manual', headers: url.startsWith('https://api.github.com/')
        ? { Authorization: 'Bearer ' + env.GITHUB_TOKEN } : {}, signal: AbortSignal.timeout(20000) });
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      requireThat(redirects < 3, 'LOG_REDIRECT_LIMIT'); const next = new URL(response.headers.get('location'), url);
      requireThat(next.protocol === 'https:' && !next.username && !next.password, 'SAFE_LOG_REDIRECT'); url = next.href;
    }
    requireThat(response.ok && response.body, 'COMPLETED_LOGS_REQUIRED');
    const reader = response.body.getReader(); const chunks = []; let size = 0;
    try { for (;;) { const {done, value} = await reader.read(); if (done) break; size += value.byteLength;
      requireThat(size <= 16 * 1024 * 1024, 'LOG_SIZE'); chunks.push(value); } }
    finally { await reader.cancel(); reader.releaseLock(); }
    const log = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks));
    const bytes = decodeProof(log, { repository: env.GITHUB_REPOSITORY, job: 'site', role: 'site-built-evidence',
      sourceSha: env.GITHUB_SHA, runId: env.GITHUB_RUN_ID, attempt: env.GITHUB_RUN_ATTEMPT });
    const identity = { repository: env.GITHUB_REPOSITORY, job: 'site', role: 'site-built-evidence',
      sourceSha: env.GITHUB_SHA, runId: env.GITHUB_RUN_ID, attempt: env.GITHUB_RUN_ATTEMPT };
    const uploadResults = decodeUploadOutcomes(log, bytes, job, identity);
    const check = job.check_run_url?.match(/^https:\/\/api\.github\.com\/(repos\/bitcoinuniverseio\/atomicals-and-arc-20\/check-runs\/[0-9]+)$/);
    requireThat(check, 'BOUND_CHECK_RUN_REQUIRED');
    await verifyUploadResults(() => api(check[1] + '/annotations?per_page=100'), uploadResults);
    const report = JSON.parse(bytes);
    requireThat(report.schemaVersion === 'committed-site-build-evidence-v1' && report.sourceSha === env.GITHUB_SHA
      && Array.isArray(report.files) && report.files.length > 0 && report.files.length <= 5000, 'VERIFIED_SITE_REPORT');
    const published = JSON.parse(readFileSync('.site-manifest.json')).files;
    requireThat(JSON.stringify(published) === JSON.stringify(report.files.map(file => file.path)), 'EXACT_PUBLISHED_FILE_SET');
    for (const file of report.files) {
      requireThat(/^[a-zA-Z0-9_./-]+$/.test(file.path) && !file.path.split('/').includes('..'), 'SITE_PATH');
      const bytes = readFileSync(file.path);
      requireThat(bytes.length === file.bytes && sha(bytes) === file.sha256, 'COMMITTED_SITE_DIGEST');
    }
    console.log(JSON.stringify({ verifiedRemoteLogProof: true, producerJobId: job.id, sourceSha: env.GITHUB_SHA,
      runId: env.GITHUB_RUN_ID, attempt: env.GITHUB_RUN_ATTEMPT, bytes: bytes.length, sha256: sha(bytes) }));
  } else throw new Error('UNKNOWN_COMMAND');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
