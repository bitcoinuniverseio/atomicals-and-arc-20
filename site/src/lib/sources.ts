import manifest from '../../../contracts/source-manifest.json'

export type SourceEntry = (typeof manifest.sources)[number]

const byId = new Map<string, SourceEntry>(
  manifest.sources.map((entry) => [entry.id, entry as SourceEntry]),
)

export const sourceManifest = manifest

export function getSource(id: string): SourceEntry {
  const entry = byId.get(id)
  if (!entry) {
    throw new Error(
      `Unknown source id "${id}". Add it to contracts/source-manifest.json before referencing it.`,
    )
  }
  return entry
}

/** Short revision label used in the provenance panel. */
export function shortRevision(entry: SourceEntry): string {
  if (entry.release) return entry.release
  if (entry.revision) return entry.revision.slice(0, 12)
  return 'unversioned'
}

/**
 * Deep link to the exact source line range where one exists.
 * Private repositories still get a link so an operator with access lands on the right file.
 */
export function sourceUrl(entry: SourceEntry, path?: string): string {
  if (!path) return entry.repository
  if (/^https?:\/\//.test(path)) return path
  const key = path as keyof typeof entry.paths
  const resolved =
    entry.paths && key in entry.paths ? (entry.paths[key] as string) : path
  if (/^https?:\/\//.test(resolved)) return resolved
  const ref = entry.revision ?? 'HEAD'
  return `${entry.repository}/blob/${ref}/${resolved}`
}

/**
 * The fallback used when a page declares an applicability the labels do not cover.
 * Declared as its own constant so the lookup below has a definitely defined default:
 * under noUncheckedIndexedAccess an index into the map is itself possibly undefined,
 * so falling back to another index would not remove the uncertainty.
 */
export const EDITORIAL_FALLBACK = {
  label: 'Editorial',
  tone: 'idle',
  meaning: 'Navigation or explanatory writing with no source-sensitive claim of its own.',
}

export const APPLICABILITY_LABELS: Record<
  string,
  { label: string; tone: string; meaning: string }
> = {
  'protocol-behavior': {
    label: 'Protocol behavior',
    tone: 'protocol',
    meaning:
      'Describes the Atomicals protocol itself at the pinned reference revision. It does not promise that any product exposes it.',
  },
  'universe-implementation': {
    label: 'Universe implementation',
    tone: 'universe',
    meaning:
      'Describes what a Bitcoin Universe service actually does today. It is not a statement about the protocol in general.',
  },
  experimental: {
    label: 'Experimental or beta',
    tone: 'warn',
    meaning:
      'Behavior exists in beta or unreleased code. Do not build production dependencies on it.',
  },
  proposed: {
    label: 'Proposed',
    tone: 'idle',
    meaning: 'A proposal exists. Nothing here is implemented or activated by that fact alone.',
  },
  deprecated: {
    label: 'Deprecated',
    tone: 'risk',
    meaning: 'Still reachable, but scheduled for removal. Use the stated replacement.',
  },
  unavailable: {
    label: 'Unavailable',
    tone: 'risk',
    meaning: 'Not exposed by any Universe product surface today.',
  },
  'third-party': {
    label: 'Third-party integration',
    tone: 'idle',
    meaning: 'Operated by someone else. Not normative and not endorsed.',
  },
  editorial: EDITORIAL_FALLBACK,
}

export const AUTHORITY_LABELS: Record<string, string> = {
  'executed-source': 'Executed source code at a pinned revision',
  aip: 'Atomicals Improvement Proposal',
  'reference-implementation': 'Atomicals reference implementation',
  'official-documentation': 'Official Atomicals documentation',
  'universe-implementation': 'Universe implementation documentation',
  'third-party': 'Third-party material, non-normative',
  none: 'No normative source. Navigation only.',
}

/** Pages older than this are flagged as needing re-verification. */
export const STALE_AFTER_DAYS = 180

export function daysSince(isoDate: string, now = new Date()): number {
  const then = Date.parse(`${isoDate}T00:00:00Z`)
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY
  return Math.floor((now.getTime() - then) / 86_400_000)
}
