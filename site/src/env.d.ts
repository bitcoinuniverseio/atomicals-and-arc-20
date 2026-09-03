/// <reference types="@astrojs/starlight/locals" />

// Starlight resolves these virtual modules to the configured component
// overrides at build time; the override components import them the same way
// Starlight's own components do.
declare module 'virtual:starlight/components/*' {
  const Component: (props: Record<string, unknown>) => unknown
  export default Component
}

declare module 'virtual:starlight/pagefind-config' {
  export const pagefindUserConfig: Record<string, unknown>
}

declare module '@pagefind/default-ui' {
  export const PagefindUI: new (options: Record<string, unknown>) => unknown
}
