#!/usr/bin/env node
/**
 * Validates the Arazzo 1.1.0 documents and generates every derived workflow
 * artefact: the machine-readable summary the site and MCP consume, plus curl,
 * TypeScript, and JavaScript examples per workflow. Nothing here is hand
 * maintained twice.
 *
 * Validation covers the official meta-schema (vendored, extended to 1.1) and
 * resolution of every referenced operationId against the OpenAPI contracts.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'
import Ajv from 'ajv/dist/2020.js'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(here, '..')

const ajv = new Ajv({ allErrors: true, strict: false })
const arazzoSchema = JSON.parse(
  readFileSync(resolve(ROOT, 'contracts/vendor/schemas/arazzo-1.1.schema.json'), 'utf8'),
)
const validateArazzo = ajv.compile(arazzoSchema)

// Operation index across every OpenAPI document, keyed by the namespace the
// Arazzo sourceProviders declare for that document.
const NAMESPACE_TO_DOCUMENT = {
  arc20: 'arc20',
  nftrealms: 'atomicals-nfts-realms',
  marketplace: 'marketplace-v1',
}
const operationIndex = new Map()
for (const name of Object.values(NAMESPACE_TO_DOCUMENT)) {
  const document = JSON.parse(readFileSync(resolve(ROOT, `contracts/openapi/${name}.json`), 'utf8'))
  for (const [path, item] of Object.entries(document.paths ?? {})) {
    for (const [method, operation] of Object.entries(item)) {
      if (typeof operation?.operationId === 'string') {
        operationIndex.set(`${name}.${operation.operationId}`, {
          document: name,
          method: method.toUpperCase(),
          path,
          operationId: operation.operationId,
          summary: operation.summary ?? '',
          readOnly: operation['x-read-only'] === true,
        })
      }
    }
  }
}

const workflowsDir = resolve(ROOT, 'contracts/workflows')
const files = readdirSync(workflowsDir).filter((file) => file.endsWith('.arazzo.yaml'))
const failures = []
const generated = []

for (const file of files) {
  const raw = readFileSync(resolve(workflowsDir, file), 'utf8')
  const document = YAML.parse(raw)

  if (!validateArazzo(document)) {
    failures.push(`${file}: ${validateArazzo.errors?.map((error) => `${error.instancePath} ${error.message}`).join('; ')}`)
    continue
  }

  for (const workflow of document.workflows ?? []) {
    for (const step of workflow.steps ?? []) {
      const reference = String(step.operationId ?? '')
      const namespace = reference.split('.')[0]
      const localId = reference.split('.').slice(1).join('.')
      const documentName = NAMESPACE_TO_DOCUMENT[namespace]
      const operation = documentName ? operationIndex.get(`${documentName}.${localId}`) : undefined
      if (!operation) {
        failures.push(`${file}: ${workflow.workflowId}/${step.stepId} references unknown operation ${reference}`)
        continue
      }
      if (operation.method !== 'GET' && operation.method !== 'HEAD' && !/regtest|local|Local/i.test(step.description ?? '')) {
        failures.push(`${file}: ${workflow.workflowId}/${step.stepId} calls mutation ${reference} outside a regtest-scoped step`)
      }
    }

    generated.push({
      workflowId: workflow.workflowId,
      summary: workflow.summary ?? '',
      description: workflow.description ?? '',
      document: file,
      steps: (workflow.steps ?? []).map((step) => {
        const reference = String(step.operationId ?? '')
        const namespace = reference.split('.')[0]
        const documentName = NAMESPACE_TO_DOCUMENT[namespace]
        const operation = documentName ? operationIndex.get(`${documentName}.${reference.split('.').slice(1).join('.')}`) : undefined
        const origin = operation.path.includes('marketplace')
          ? 'https://marketplace-lab.example'
          : 'http://127.0.0.1:3043'
        return {
          stepId: step.stepId,
          operationId: reference,
          method: operation.method,
          path: operation.path,
          origin,
          curl: `curl -sS -H 'accept: application/json' ${origin}${operation.path.replace(/\{[^}]+\}/g, 'REPLACE_ME')}`,
          typescript: `const response = await client.${operation.operationId.replace(/([A-Z])/g, '_$1').toLowerCase()}(/* parameters per ${operation.document} contract */)\nassert(response.ok)`,
          javascript: `const response = await fetch('${origin}${operation.path}', { headers: { accept: 'application/json' } })\nif (!response.ok) throw new Error('step ${step.stepId} failed')`,
          successCriteria: step.successCriteria ?? [],
        }
      }),
    })
  }
}

if (failures.length > 0) {
  for (const failure of failures) process.stderr.write(`FAILED ${failure}\n`)
  process.exit(1)
}

mkdirSync(resolve(ROOT, 'site/src/generated'), { recursive: true })
writeFileSync(
  resolve(ROOT, 'site/src/generated/workflows.json'),
  `${JSON.stringify({ generatedBy: 'scripts/generate-workflows.mjs', workflows: generated }, null, 2)}\n`,
)

const summary = {
  workflows: generated.length,
  files: files.length,
  note: 'Generated from contracts/workflows. Do not edit site/src/generated/workflows.json by hand.',
}
process.stdout.write(`validated ${summary.files} Arazzo document(s), ${summary.workflows} workflow(s); artefacts generated\n`)
