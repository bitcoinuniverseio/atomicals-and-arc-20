import { defineCollection, z } from 'astro:content'
import { docsLoader } from '@astrojs/starlight/loaders'
import { docsSchema } from '@astrojs/starlight/schema'

/**
 * Applicability label shown in the "Source and applicability" panel.
 * Every page states exactly which layer it describes.
 */
export const APPLICABILITY = [
  'protocol-behavior',
  'universe-implementation',
  'experimental',
  'proposed',
  'deprecated',
  'unavailable',
  'third-party',
  'editorial',
] as const

export const NORMATIVE_AUTHORITY = [
  'executed-source',
  'aip',
  'reference-implementation',
  'official-documentation',
  'universe-implementation',
  'third-party',
  'none',
] as const

export const NETWORKS = ['mainnet', 'testnet', 'signet', 'regtest', 'none'] as const

export const AUDIENCES = ['everyone', 'holder', 'creator', 'developer', 'operator', 'integrator'] as const

export const AREAS = [
  'start',
  'protocol',
  'guides',
  'develop',
  'reference',
  'tools',
  'ecosystem',
  'releases',
  'contribute',
] as const

const sourceRef = z.object({
  /** Matching `id` in contracts/source-manifest.json. */
  id: z.string(),
  /** Path or contract identifier inside that source. */
  path: z.string().optional(),
  /** Human label shown in the provenance panel. */
  note: z.string().optional(),
})

const deprecation = z.object({
  since: z.string(),
  reason: z.string(),
  replacement: z.string().optional(),
  sunset: z.string().optional(),
})

export const provenanceSchema = z.object({
  /** Stable page identity. Never reuse. Never rename without a redirect. */
  pageId: z.string().regex(/^[a-z0-9]+(?:[-/][a-z0-9]+)*$/),
  area: z.enum(AREAS),
  audience: z.array(z.enum(AUDIENCES)).min(1),
  applicability: z.enum(APPLICABILITY),
  authority: z.enum(NORMATIVE_AUTHORITY),
  networks: z.array(z.enum(NETWORKS)).min(1),
  /** Source manifest entries this page depends on. */
  sources: z.array(sourceRef).default([]),
  /** Documentation version line this page describes. */
  docsVersion: z.string().default('2026.08'),
  /** Activation height or version boundary, when the behavior has one. */
  activation: z.string().optional(),
  verified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  owner: z.string().default('bitcoin-universe-docs'),
  reviewers: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([]),
  deprecated: deprecation.optional(),
  /** Set on a translated page: sha-256 of the English source body it was translated from. */
  translationSourceHash: z.string().regex(/^[0-9a-f]{64}$/).optional(),
  /** Hide the provenance panel on purely navigational pages. */
  hideProvenance: z.boolean().default(false),
})

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({ extend: z.object({ provenance: provenanceSchema }) }),
  }),
}
