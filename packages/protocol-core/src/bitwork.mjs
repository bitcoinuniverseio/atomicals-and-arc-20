/**
 * Bitwork search math, implemented from the pinned reference revision.
 *
 * Source: atomicals-electrumx at 8df23747835c20230fc8b8097d469e7a1d97c3e0
 *   electrumx/lib/util_atomicals.py (bitwork prefix and extension checks)
 *
 * Each hexadecimal prefix character is 4 fixed bits. The extension adds whole
 * bits on top. Pure math only: the caller supplies the hashing rate.
 */

/** Hexadecimal characters per prefix character: 4 bits each. */
export const BITS_PER_PREFIX_CHAR = 4

/**
 * Total difficulty bits for a prefix plus an extension of whole bits.
 * The reference caps the prefix; anything beyond 12 characters is outside any
 * practical search and callers should refuse it before calling here.
 */
export function bitworkBits(prefixLength, extensionBits = 0) {
  if (!Number.isInteger(prefixLength) || prefixLength < 0) {
    throw new RangeError('prefixLength must be a non-negative integer')
  }
  if (!Number.isInteger(extensionBits) || extensionBits < 0) {
    throw new RangeError('extensionBits must be a non-negative integer')
  }
  return prefixLength * BITS_PER_PREFIX_CHAR + extensionBits
}

/** Expected number of hash attempts before a hit: 2 to the power of the bits. */
export function expectedAttempts(bits) {
  return Math.pow(2, bits)
}

/**
 * Probability of having found a hit after n attempts, where each attempt
 * succeeds with p = 2^-bits.
 */
export function probabilityAfter(attempts, bits) {
  const p = Math.pow(2, -bits)
  return 1 - Math.pow(1 - p, attempts)
}

/**
 * A small effort table for display: attempts, wall-clock seconds at the given
 * hashing rate, and cumulative success probability at multiples of the
 * expected attempt count.
 */
export function effortTable(bits, attemptsPerSecond, multiples = [0.5, 1, 2, 3]) {
  const expected = expectedAttempts(bits)
  return multiples.map((multiple) => {
    const attempts = expected * multiple
    return {
      multiple,
      attempts,
      seconds: attempts / attemptsPerSecond,
      probability: probabilityAfter(attempts, bits),
    }
  })
}

/** Practicality band used by the estimator UI to pick a status tone. */
export function practicality(bits) {
  if (bits > 32) return { tone: 'risk', label: 'impractical for most setups' }
  if (bits > 24) return { tone: 'warn', label: 'expensive' }
  return { tone: 'ok', label: 'reasonable' }
}
