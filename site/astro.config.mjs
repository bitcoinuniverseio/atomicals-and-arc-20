// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import mdx from '@astrojs/mdx'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { satteri } from '@astrojs/markdown-satteri'
import { docLinksPlugin } from './src/lib/satteri-doc-links.mjs'

const siteMeta = JSON.parse(
  readFileSync(new URL('./src/data/site.json', import.meta.url), 'utf8'),
)

/**
 * site.json is read at runtime rather than imported, so its entries carry no type.
 * @type {{code: string, label: string, lang: string, dir?: 'ltr' | 'rtl'}[]}
 */
const locales = siteMeta.locales

const localeEntries = Object.fromEntries(
  locales.map((locale) => [
    locale.code === siteMeta.defaultLocale ? 'root' : locale.code,
    {
      label: locale.label,
      lang: locale.lang,
      dir: locale.dir ?? 'ltr',
    },
  ]),
)

export default defineConfig({
  site: siteMeta.site,
  base: siteMeta.base,
  trailingSlash: 'always',
  build: {
    format: 'directory',
    assets: '_astro',
    inlineStylesheets: 'auto',
  },
  outDir: fileURLToPath(new URL('./dist', import.meta.url)),
  compressHTML: true,
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  image: { responsiveStyles: true },
  markdown: {
    processor: satteri({ mdastPlugins: [docLinksPlugin] }),
  },
  integrations: [
    starlight({
      title: siteMeta.title,
      description: siteMeta.description,
      tagline: siteMeta.tagline,
      defaultLocale: 'root',
      locales: localeEntries,
      credits: false,
      // Off deliberately. Starlight derives this from the git commit date, which makes
      // the built HTML a function of the commit history rather than of the working
      // tree. Since the built site is committed to the repository root, that would
      // leave every page one commit stale and could never converge.
      //
      // The date readers need is in the source panel: `verified` is the day a person
      // last checked the claim against the pinned revision. A commit that fixes a typo
      // does not re-verify a protocol claim, and should not look as though it did.
      lastUpdated: false,
      pagination: true,
      titleDelimiter: '|',
      favicon: '/favicon.svg',
      logo: {
        light: './src/assets/mark-light.svg',
        dark: './src/assets/mark-dark.svg',
        alt: 'Atomicals and ARC-20 documentation',
        replacesTitle: false,
      },
      editLink: {
        baseUrl: `${siteMeta.repository}/edit/main/site/`,
      },
      social: [
        {
          icon: 'github',
          label: 'Documentation repository',
          href: siteMeta.repository,
        },
      ],
      customCss: [
        './src/styles/tokens.css',
        './src/styles/theme.css',
        './src/styles/components.css',
      ],
      components: {
        Head: './src/components/overrides/Head.astro',
        Header: './src/components/overrides/Header.astro',
        PageTitle: './src/components/overrides/PageTitle.astro',
        Footer: './src/components/overrides/Footer.astro',
        SiteTitle: './src/components/overrides/SiteTitle.astro',
      },
      expressiveCode: {
        themes: ['github-light', 'github-dark'],
        styleOverrides: {
          borderRadius: '10px',
          codeFontFamily:
            "'JetBrains Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
        },
      },
      pagefind: {
        ranking: { pageLength: 0.6, termFrequency: 1, termSaturation: 1.2 },
      },
      sidebar: siteMeta.sidebar,
      head: [
        {
          tag: 'meta',
          attrs: { name: 'theme-color', content: '#f7f7f2' },
        },
      ],
    }),
    mdx(),
  ],
})
