import test from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Accessibility invariants checked against the built HTML and CSS.
 *
 * These are the WCAG 2.2 AA properties that can be established from the static
 * output: landmarks, heading order, labelling, focus, target size, contrast of
 * the declared token pairs, reduced motion, and language metadata. They run on
 * every page rather than on a sample, because a violation on one route is still
 * a violation.
 */
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'site/dist')
const siteMeta = JSON.parse(readFileSync(resolve(root, 'site/src/data/site.json'), 'utf8'))

function walk(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  )
}

const built = existsSync(resolve(dist, 'index.html'))
const htmlFiles = built ? walk(dist).filter((file) => file.endsWith('.html')) : []
const where = (file) => relative(dist, file).split('\\').join('/')

/**
 * Rendered markup only.
 *
 * Script and style bodies are text, not elements. A heading or an input written
 * inside a template literal in a component script is not in the accessibility
 * tree, and counting it produces a false failure that teaches nothing.
 */
function markup(file) {
  return readFileSync(file, 'utf8')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
}

// ---------------------------------------------------------------- contrast

/** Relative luminance per WCAG 2.x. */
function luminance(hex) {
  const value = hex.replace('#', '')
  const channels = [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16) / 255)
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

function contrast(foreground, background) {
  const a = luminance(foreground)
  const b = luminance(background)
  const lighter = Math.max(a, b)
  const darker = Math.min(a, b)
  return (lighter + 0.05) / (darker + 0.05)
}

function readTokens(block) {
  const tokens = {}
  for (const match of block.matchAll(/--(bu-[a-z0-9-]+):\s*(#[0-9a-fA-F]{6});/g)) {
    tokens['--' + match[1]] = match[2]
  }
  return tokens
}

const tokensCss = readFileSync(resolve(root, 'site/src/styles/tokens.css'), 'utf8')
const lightBlock = tokensCss.slice(
  tokensCss.indexOf(':root,'),
  tokensCss.indexOf(":root[data-theme='dark']"),
)
const darkBlock = tokensCss.slice(tokensCss.indexOf(":root[data-theme='dark']"))
const light = readTokens(lightBlock)
const dark = readTokens(darkBlock)

// Pairs the design actually renders. Body text and interactive text need 4.5:1;
// large headings and non-text boundaries need 3:1.
const TEXT_PAIRS = [
  ['--bu-ink', '--bu-paper'],
  ['--bu-ink', '--bu-surface'],
  ['--bu-ink', '--bu-surface-sunken'],
  ['--bu-ink-soft', '--bu-paper'],
  ['--bu-ink-soft', '--bu-surface'],
  ['--bu-ink-muted', '--bu-paper'],
  ['--bu-ink-muted', '--bu-surface'],
  ['--bu-ink-muted', '--bu-surface-sunken'],
  ['--bu-accent', '--bu-paper'],
  ['--bu-accent', '--bu-surface'],
  ['--bu-accent-strong', '--bu-accent-quiet'],
  ['--bu-ok', '--bu-ok-quiet'],
  ['--bu-warn', '--bu-warn-quiet'],
  ['--bu-risk', '--bu-risk-quiet'],
  ['--bu-info', '--bu-info-quiet'],
  ['--bu-idle', '--bu-idle-quiet'],
  ['--bu-paper', '--bu-accent'],
]

/**
 * WCAG 2.2 SC 1.4.11 applies to the boundary of a user interface component and to
 * meaningful graphics, not to every line drawn on the page. Card and table rules are
 * decoration: removing them loses nothing a reader needs. The border of an input, a
 * select, a textarea, or a button is the component, so it is checked here against
 * every surface it is ever drawn on.
 */
const NON_TEXT_PAIRS = [
  ['--bu-line-control', '--bu-paper'],
  ['--bu-line-control', '--bu-surface'],
  ['--bu-line-control', '--bu-surface-sunken'],
  ['--bu-focus', '--bu-paper'],
  ['--bu-focus', '--bu-surface'],
  ['--bu-focus', '--bu-surface-sunken'],
]

test('the site has been built before these checks run', () => {
  assert.ok(built, 'Run `npm run build` first. These checks read site/dist.')
})

test('every text colour pair meets WCAG 2.2 AA in both themes', () => {
  const failures = []
  for (const [theme, tokens] of [
    ['light', light],
    ['dark', dark],
  ]) {
    for (const [foreground, background] of TEXT_PAIRS) {
      const fg = tokens[foreground]
      const bg = tokens[background]
      assert.ok(fg, `${theme} theme is missing ${foreground}`)
      assert.ok(bg, `${theme} theme is missing ${background}`)
      const ratio = contrast(fg, bg)
      if (ratio < 4.5) {
        failures.push(`${theme}: ${foreground} on ${background} is ${ratio.toFixed(2)}:1`)
      }
    }
  }
  assert.deepEqual(failures, [], 'text contrast below 4.5:1')
})

test('every non-text boundary pair meets WCAG 2.2 AA in both themes', () => {
  const failures = []
  for (const [theme, tokens] of [
    ['light', light],
    ['dark', dark],
  ]) {
    for (const [foreground, background] of NON_TEXT_PAIRS) {
      const ratio = contrast(tokens[foreground], tokens[background])
      if (ratio < 3) {
        failures.push(`${theme}: ${foreground} on ${background} is ${ratio.toFixed(2)}:1`)
      }
    }
  }
  assert.deepEqual(failures, [], 'non-text contrast below 3:1')
})

test('both themes define every colour token, so neither falls back', () => {
  const missing = []
  for (const token of Object.keys(light)) {
    if (!(token in dark)) missing.push(`dark theme is missing ${token}`)
  }
  for (const token of Object.keys(dark)) {
    if (!(token in light)) missing.push(`light theme is missing ${token}`)
  }
  assert.deepEqual(missing, [], 'a theme would fall back to the other theme colour')
})

test('the stylesheet honours reduced motion', () => {
  const theme = readFileSync(resolve(root, 'site/src/styles/theme.css'), 'utf8')
  assert.match(theme, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(theme, /animation-duration: 0\.001ms !important/)
  assert.match(theme, /transition-duration: 0\.001ms !important/)
})

test('the stylesheet declares a visible focus indicator', () => {
  const theme = readFileSync(resolve(root, 'site/src/styles/theme.css'), 'utf8')
  assert.match(theme, /:focus-visible/)
  assert.match(theme, /outline: 3px solid var\(--bu-focus\)/)
})

test('primary interactive controls declare the minimum target size', () => {
  const components = readFileSync(resolve(root, 'site/src/styles/components.css'), 'utf8')
  const tokens = readFileSync(resolve(root, 'site/src/styles/tokens.css'), 'utf8')
  assert.match(tokens, /--bu-touch: 44px/)
  assert.match(components, /\.bu-btn[\s\S]*?min-height: var\(--bu-touch\)/)
  assert.match(components, /\.bu-field input[\s\S]*?min-height: var\(--bu-touch\)/)
})

test('tables and wide content scroll inside their own container', () => {
  const theme = readFileSync(resolve(root, 'site/src/styles/theme.css'), 'utf8')
  const components = readFileSync(resolve(root, 'site/src/styles/components.css'), 'utf8')
  assert.match(theme, /overflow-x: auto/)
  assert.match(components, /\.bu-matrix \{[\s\S]*?overflow-x: auto/)
})

test('every page declares a language matching its locale', () => {
  const byLocale = new Map(siteMeta.locales.map((locale) => [locale.code, locale.lang]))
  const problems = []
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8')
    const match = html.match(/<html[^>]*\slang="([^"]+)"/)
    if (!match) {
      problems.push(`${where(file)}: no lang attribute`)
      continue
    }
    const path = where(file)
    const head = path.split('/')[0]
    const expected = byLocale.get(head) ?? byLocale.get(siteMeta.defaultLocale)
    if (match[1] !== expected) {
      problems.push(`${path}: lang is ${match[1]}, expected ${expected}`)
    }
  }
  assert.deepEqual(problems.slice(0, 25), [], `${problems.length} language metadata problem(s)`)
})

test('every page provides landmarks and a skip link', () => {
  const problems = []
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8')
    const path = where(file)
    if (!/<main\b/.test(html)) problems.push(`${path}: no main landmark`)
    if (!/<header\b/.test(html)) problems.push(`${path}: no header landmark`)
    if (!/<a[^>]+href="#_top"|class="[^"]*skip/.test(html)) {
      problems.push(`${path}: no skip link`)
    }
  }
  assert.deepEqual(problems.slice(0, 25), [], `${problems.length} landmark problem(s)`)
})

test('heading levels never skip a level', () => {
  const problems = []
  for (const file of htmlFiles) {
    const html = markup(file)
    const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((match) => Number(match[1]))
    let previous = 0
    for (const level of levels) {
      if (previous !== 0 && level > previous + 1) {
        problems.push(`${where(file)}: h${previous} followed by h${level}`)
        break
      }
      previous = level
    }
  }
  assert.deepEqual(problems.slice(0, 25), [], `${problems.length} heading order problem(s)`)
})

test('every form control in the built output has an accessible name', () => {
  const problems = []
  for (const file of htmlFiles) {
    const html = markup(file)
    const path = where(file)

    // Three ways a control gets a name: a label that references its id, a
    // wrapping label, or an aria attribute. All three are valid, and the
    // wrapping form is what Starlight's own selects use.
    const labelledIds = new Set(
      [...html.matchAll(/<label[^>]+for="([^"]+)"/g)].map((match) => match[1]),
    )
    const wrapped = new Set()
    for (const label of html.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/g)) {
      const inner = label[1]
      const hasText = inner.replace(/<[^>]+>/g, '').trim().length > 0
      if (!hasText) continue
      for (const control of inner.matchAll(/<(input|select|textarea)\b[^>]*>/g)) {
        wrapped.add(control[0])
      }
    }

    for (const match of html.matchAll(/<(input|select|textarea)\b[^>]*>/g)) {
      const tag = match[0]
      if (/type="hidden"/.test(tag)) continue
      const id = tag.match(/\sid="([^"]+)"/)?.[1]
      const named =
        (id && labelledIds.has(id)) ||
        wrapped.has(tag) ||
        /aria-label="/.test(tag) ||
        /aria-labelledby="/.test(tag) ||
        /title="/.test(tag)
      if (!named) problems.push(`${path}: unlabelled ${match[1]} ${tag.slice(0, 70)}`)
    }
  }
  assert.deepEqual(problems.slice(0, 25), [], `${problems.length} unlabelled control(s)`)
})

test('every button has a discernible name', () => {
  const problems = []
  for (const file of htmlFiles) {
    const html = markup(file)
    for (const match of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
      const attributes = match[1]
      const text = match[2].replace(/<[^>]+>/g, '').trim()
      const named = text.length > 0 || /aria-label="/.test(attributes) || /title="/.test(attributes)
      if (!named) problems.push(`${where(file)}: button with no accessible name`)
    }
  }
  assert.deepEqual(problems.slice(0, 25), [], `${problems.length} unnamed button(s)`)
})

test('every diagram exposes a text equivalent', () => {
  const problems = []
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8')
    for (const match of html.matchAll(/<figure[^>]*class="[^"]*bu-figure[^"]*"[\s\S]*?<\/figure>/g)) {
      const figure = match[0]
      if (!/role="img"/.test(figure)) problems.push(`${where(file)}: diagram without role img`)
      if (!/aria-labelledby="/.test(figure)) {
        problems.push(`${where(file)}: diagram without an accessible name`)
      }
      if (!/<figcaption/.test(figure)) {
        problems.push(`${where(file)}: diagram without a caption`)
      }
      if (!/aria-hidden="true"/.test(figure)) {
        problems.push(`${where(file)}: diagram svg not hidden from the accessibility tree`)
      }
    }
  }
  assert.deepEqual(problems.slice(0, 25), [], `${problems.length} diagram accessibility problem(s)`)
})

test('every data table has a caption or an accessible name', () => {
  const problems = []
  for (const file of htmlFiles) {
    const html = markup(file)
    for (const match of html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/g)) {
      const table = match[0]
      const inner = match[1]
      const named =
        /<caption/.test(inner) || /aria-label="/.test(table) || /aria-labelledby="/.test(table)
      // Markdown tables carry their meaning in the surrounding prose and a
      // column header row, which is sufficient. Component tables must be named.
      if (!named && /class="[^"]*bu-matrix/.test(table)) {
        problems.push(`${where(file)}: component table without a caption`)
      }
      if (!/<th\b/.test(inner)) problems.push(`${where(file)}: table without header cells`)
    }
  }
  assert.deepEqual(problems.slice(0, 25), [], `${problems.length} table accessibility problem(s)`)
})

test('dynamic tool output is announced', () => {
  const toolPages = htmlFiles.filter((file) => where(file).includes('tools/'))
  assert.ok(toolPages.length > 0, 'the tools pages must be built')
  const problems = []
  for (const file of toolPages) {
    const html = readFileSync(file, 'utf8')
    if (!/bu-tool/.test(html)) continue
    if (!/aria-live="polite"/.test(html) && !/role="alert"/.test(html)) {
      problems.push(`${where(file)}: tool output is not announced`)
    }
  }
  assert.deepEqual(problems, [], 'tool results must be announced to assistive technology')
})

test('every interactive tool degrades without JavaScript', () => {
  const toolPages = htmlFiles.filter((file) => /\/tools\/[a-z-]+\/index\.html$/.test(where(file)))
  assert.ok(toolPages.length > 0, 'the tool pages must be built')
  const problems = []
  for (const file of toolPages) {
    const html = readFileSync(file, 'utf8')
    if (!/bu-tool/.test(html)) continue
    if (!/<noscript>/.test(html)) problems.push(`${where(file)}: no noscript fallback`)
  }
  assert.deepEqual(problems, [], 'every tool page needs a noscript explanation')
})
