import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { encodeProof, decodeProof, quotaAnnotationsOnly, verifyCompletedJob, encodeUploadOutcome, decodeUploadOutcomes, verifyUploadAnnotations, verifyUploadResults } from './ci-log-proof.mjs';
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
    'Check performance budgets against the built assets', 'Preserve site evidence in authenticated job logs',
    'Prove search reproducibility across fresh processes and input orders', 'Record site evidence upload outcome'];
  const job = {status:'completed',conclusion:'success',head_sha:env.PROOF_HEAD_SHA,run_id:123,run_attempt:2,
    steps:names.map(name=>({name,conclusion:'success'}))};
  verifyCompletedJob(job,env);
  for (const change of [{status:'in_progress'},{conclusion:'failure'},{head_sha:'c'.repeat(40)},
    {run_id:124},{run_attempt:1},{steps:job.steps.slice(1)},
    {steps:job.steps.map((step,i)=>i===0?{...step,conclusion:'skipped'}:step)}])
    assert.throws(()=>verifyCompletedJob({...job,...change},env));
});

const uploadRoles = ['site-built-evidence'];
const quota = {annotation_level:'failure',message:'Failed to CreateArtifact: Artifact storage quota has been hit. Unable to upload any new artifacts. Usage is recalculated every 6-12 hours.'};
test('all upload outcomes bind report digest, source, run, attempt, exact completed job and unique role', () => {
  const bytes=Buffer.from('sanitized report'); const job={id:42};
  const log=uploadRoles.map(role=>encodeUploadOutcome(bytes,job.id,role,'success',identity)).join('\n');
  assert.deepEqual(decodeUploadOutcomes(log,bytes,job,identity),{mandatoryFailed:false,failedUploads:0});
  const failed=uploadRoles.map(role=>encodeUploadOutcome(bytes,job.id,role,'failure',identity)).join('\n');
  assert.deepEqual(decodeUploadOutcomes(failed,bytes,job,identity),{mandatoryFailed:true,failedUploads:uploadRoles.length});
  assert.deepEqual(decodeUploadOutcomes(failed.split('\n').map(line=>'2026-10-20T16:00:00.0000000Z '+line).join('\n'),bytes,job,identity),{mandatoryFailed:true,failedUploads:uploadRoles.length});
  for (const broken of ['',log+'\n'+log.split('\n')[0],log.replace('"jobId":42','"jobId":43'),
    log.replace('"attempt":"2"','"attempt":"3"'),log.replace('"sourceSha":"'+'a'.repeat(40)+'"','"sourceSha":"'+'b'.repeat(40)+'"'),
    log.replace('"outcome":"success"','"outcome":"skipped"'),log.replace('"role":"'+uploadRoles[0]+'"','"role":"foreign"')])
    assert.throws(()=>decodeUploadOutcomes(broken,bytes,job,identity));
  assert.throws(()=>decodeUploadOutcomes(log,Buffer.from('different report'),job,identity));
  assert.throws(()=>decodeUploadOutcomes(log,bytes,job,{...identity,runId:'124'}));
});
test('completed annotations may publish late, but only exact quota errors matching failed receipts pass',async()=>{
  let reads=0, waits=0;
  await verifyUploadAnnotations(async()=>++reads===1?[]:Array(uploadRoles.length).fill(quota),uploadRoles.length,async()=>{waits++});
  assert.equal(reads,2);assert.equal(waits,1);
  await verifyUploadAnnotations(async()=>[],0,async()=>assert.fail('No wait needed for successful uploads'));
  await verifyUploadAnnotations(async()=>Array(uploadRoles.length).fill(quota),uploadRoles.length);
  for (const annotations of [[{...quota,message:'Network error'}],[quota,{...quota,message:'Tests failed'}],Array(uploadRoles.length+1).fill(quota)])
    await assert.rejects(verifyUploadAnnotations(async()=>annotations,uploadRoles.length,async()=>{}));
  await assert.rejects(verifyUploadAnnotations(async()=>[quota],0));
  await assert.rejects(verifyUploadAnnotations(async()=>Array(100).fill({annotation_level:'warning'}),1));
  let attempts=0;
  await assert.rejects(verifyUploadAnnotations(async()=>{attempts++;return []},1,async()=>{}),/COMPLETED_QUOTA_ANNOTATIONS_REQUIRED/);
  assert.equal(attempts,10);
});

test('ordinary report retention preserves optional binary failure, while report fallback rejects mixed errors',async()=>{
  const bytes=Buffer.from('safe report'), job={id:42};
  const ordinary=uploadRoles.map((role,i)=>encodeUploadOutcome(bytes,42,role,i===0?'success':'failure',identity)).join('\n');
  await verifyUploadResults(async()=>assert.fail('No fallback classification for retained mandatory report'),decodeUploadOutcomes(ordinary,bytes,job,identity));
  const failed=uploadRoles.map(role=>encodeUploadOutcome(bytes,42,role,'failure',identity)).join('\n');
  const result=decodeUploadOutcomes(failed,bytes,job,identity);
  await verifyUploadResults(async()=>Array(uploadRoles.length).fill(quota),result);
  await assert.rejects(verifyUploadResults(async()=>[quota,{...quota,message:'Network error'}],result,async()=>{}));
});

test('workflow requires completed proof consumer with no soft failure and records every upload outcome',()=>{
  const workflow=readFileSync(new URL('./workflows/ci.yml',import.meta.url),'utf8');
  const consumer=workflow.split('\n  site-evidence-proof:\n')[1];
  assert.ok(consumer);
  assert.match(consumer,/needs: site\n/);
  assert.ok(consumer.includes("needs.site.result == 'success'"));
  assert.match(consumer,/run: node \.github\/ci-log-proof\.mjs verify-completed/);
  assert.doesNotMatch(consumer,/continue-on-error/);
  assert.doesNotMatch(workflow,/ci-log-proof\.mjs quota-only/);
  assert.ok(workflow.includes('upload-outcome "$RUNNER_TEMP/site-built-evidence.json" site-built-evidence "${{ steps.site-evidence-upload.outcome }}"'));
});

test('completed consumer CLI verifies remote proof, exact upload receipts and annotations through safe redirect',()=>{
  const directory=mkdtempSync(join(tmpdir(),'completed-proof-'));
  try {
    writeFileSync(join(directory,'index.html'),'safe');
    writeFileSync(join(directory,'.site-manifest.json'),JSON.stringify({files:['index.html']}));
    const report={schemaVersion:'committed-site-build-evidence-v1',sourceSha:identity.sourceSha,files:[{path:'index.html',bytes:4,sha256:createHash('sha256').update('safe').digest('hex')}]};
    const bytes=Buffer.from(JSON.stringify(report));
    const job={id:42,name:'Site build, links, and artefacts',status:'completed',conclusion:'success',head_sha:'b'.repeat(40),run_id:123,run_attempt:2,
      check_run_url:'https://api.github.com/repos/'+identity.repository+'/check-runs/43',steps:['Type check the site','Build the site and publish it to the repository root','Prove the build leaves the repository clean','Check links, anchors, compatibility routes, and generated artefacts','Test the documentation MCP server against the built artefacts','Check accessibility invariants in the built HTML','Check performance budgets against the built assets','Preserve site evidence in authenticated job logs','Prove search reproducibility across fresh processes and input orders','Record site evidence upload outcome'].map(name=>({name,conclusion:'success'}))};
    const log=encodeProof(bytes,identity)+'\n'+uploadRoles.map(role=>encodeUploadOutcome(bytes,42,role,'failure',identity)).join('\n');
    const run=(text,annotations,metadata=job)=>{
      const mock=`globalThis.fetch=async(url,options)=>{
        if(String(url).endsWith('/jobs?per_page=100'))return Response.json({total_count:1,jobs:[${JSON.stringify(metadata)}]});
        if(String(url).endsWith('/annotations?per_page=100'))return Response.json(${JSON.stringify(annotations)});
        if(String(url).endsWith('/logs'))return new Response(null,{status:302,headers:{location:'https://logs.example.invalid/proof'}});
        if(url==='https://logs.example.invalid/proof'){if(options.headers.Authorization)throw new Error('Cross-host credential leak');return new Response(${JSON.stringify(text)})}
        throw new Error('Unexpected API path');
      }`;
      return spawnSync(process.execPath,['--import','data:text/javascript,'+encodeURIComponent(mock),fileURLToPath(new URL('./ci-log-proof.mjs',import.meta.url)),'verify-completed'],{
        cwd:directory,encoding:'utf8',timeout:5000,env:{...process.env,GITHUB_TOKEN:'fixture-read-token',GITHUB_REPOSITORY:identity.repository,GITHUB_SHA:identity.sourceSha,
          PROOF_HEAD_SHA:'b'.repeat(40),GITHUB_RUN_ID:'123',GITHUB_RUN_ATTEMPT:'2'}});
    };
    const result=run(log,Array(uploadRoles.length).fill(quota));
    assert.equal(result.status,0,result.stderr);assert.match(result.stdout, /"verifiedRemoteLogProof":true/);
    for (const [text,annotations,metadata] of [
      [log+'\n'+log.split('\n').at(-1),Array(uploadRoles.length).fill(quota),job],
      [log,[quota,{...quota,message:'Network error'}],job],
      [log,Array(uploadRoles.length).fill(quota),{...job,head_sha:'c'.repeat(40)}],
      [log,Array(uploadRoles.length).fill(quota),{...job,steps:job.steps.slice(1)}]
    ])assert.notEqual(run(text,annotations,metadata).status,0);
  } finally {rmSync(directory,{recursive:true,force:true})}
});
