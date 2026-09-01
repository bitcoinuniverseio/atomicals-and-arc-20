/**
 * Codepoint ordering for anything that ends up in a committed file.
 *
 * `localeCompare` uses ICU collation, which treats punctuation as secondary. That
 * makes `--flag` and `-flag` sort differently under ICU than by codepoint, and it
 * ties the byte content of a generated file to the ICU data of the machine that
 * generated it. This repository commits its generated output and fails CI when a
 * rebuild changes it, so the ordering has to depend on the strings alone.
 *
 * Display-only sorting can still use `localeCompare`. This is for generation.
 */
export function byCodepoint(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}
