/// <reference path="../node_modules/@astrojs/starlight/virtual.d.ts" />
/// <reference path="../node_modules/@astrojs/starlight/virtual-internal.d.ts" />
/// <reference path="../node_modules/@astrojs/starlight/locals.d.ts" />

declare module '@pagefind/default-ui' {
  export const PagefindUI: new (options: Record<string, unknown>) => unknown
}
