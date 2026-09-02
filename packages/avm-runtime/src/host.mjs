/**
 * AVM runtime host interface: resource-limited execution of the pinned beta
 * interpreter.
 *
 * Two execution backends share this interface:
 *   - native: the container-built binary (Regtest Lab and CI parity runs)
 *   - wasm:   the container-built WebAssembly module (browser workbench)
 *
 * There is no JavaScript reimplementation of AVM semantics anywhere in this
 * repository: if a backend artifact is absent the host refuses to run and
 * says so. Nothing here is allowed to touch the network or the filesystem
 * beyond the program text handed to it.
 */

/** Hard execution limits. Every backend must enforce all of them. */
export const LIMITS = Object.freeze({
  /** Maximum WebAssembly memory the runtime may grow to. */
  memoryBytes: 64 * 1024 * 1024,
  /** Wall-clock budget per run; the host terminates the worker past it. */
  wallClockMs: 5_000,
  /** Maximum program text size accepted by the host. */
  programBytes: 256 * 1024,
  /** Maximum returned trace and output size. */
  outputBytes: 1024 * 1024,
  /** Instruction budget, enforced by the interpreter build's metering. */
  instructionCount: 10_000_000,
})

export function validateProgram(programText) {
  const size = typeof programText === 'string' ? Buffer.byteLength(programText) : programText.byteLength
  if (size === 0) return { ok: false, reason: 'the program is empty' }
  if (size > LIMITS.programBytes) {
    return { ok: false, reason: `the program exceeds the ${LIMITS.programBytes} byte limit` }
  }
  return { ok: true }
}

/**
 * Native backend: spawn the container-built binary with the program on stdin
 * and a hard wall-clock kill. Available where the artifact was built (CI,
 * Regtest Lab hosts). Refuses honestly elsewhere.
 */
export function createNativeBackend(binaryPath, spawn = (cmd, args, options) => import('node:child_process').then((m) => m.spawn(cmd, args, options))) {
  return {
    kind: 'native',
    async run(programText) {
      const check = validateProgram(programText)
      if (!check.ok) return { ok: false, error: check.reason }
      let child
      try {
        child = await spawn(binaryPath, [`--max-instructions=${LIMITS.instructionCount}`], {})
      } catch (error) {
        return { ok: false, error: `native backend unavailable: ${error?.message ?? error}` }
      }
      return new Promise((resolvePromise) => {
        let stdout = ''
        const timer = setTimeout(() => {
          child.kill('SIGKILL')
          resolvePromise({ ok: false, error: `execution exceeded the ${LIMITS.wallClockMs} ms budget and was terminated` })
        }, LIMITS.wallClockMs)
        child.stdout?.on('data', (chunk) => {
          if (stdout.length < LIMITS.outputBytes) stdout += chunk.toString()
        })
        child.on('error', (error) => {
          clearTimeout(timer)
          resolvePromise({ ok: false, error: `native backend unavailable: ${error.message}` })
        })
        child.on('close', (code) => {
          clearTimeout(timer)
          resolvePromise({ ok: code === 0, output: stdout, exitCode: code })
        })
        child.stdin?.end(programText)
      })
    },
  }
}

/**
 * WASM backend: instantiate the built module in the calling context (a
 * dedicated worker in the browser) with memory growth capped by LIMITS.
 * Refuses honestly when the release pipeline has not published the module.
 */
export async function createWasmBackend(fetchModule) {
  if (!fetchModule) return { kind: 'wasm', available: false, run: async () => ({ ok: false, error: 'the pinned WASM build is produced by the release pipeline and is not present in this deployment' }) }
  try {
    const { instance } = await fetchModule(LIMITS)
    return {
      kind: 'wasm',
      available: true,
      async run(programText) {
        const check = validateProgram(programText)
        if (!check.ok) return { ok: false, error: check.reason }
        const exports = instance.exports
        if (typeof exports.avm_run !== 'function') {
          return { ok: false, error: 'the built module does not expose the narrow host interface (avm_run)' }
        }
        const encoded = new TextEncoder().encode(programText)
        if (encoded.byteLength > LIMITS.programBytes) return { ok: false, error: 'program exceeds limits' }
        const pointer = exports.avm_alloc(encoded.byteLength)
        const memory = new Uint8Array(exports.memory.buffer)
        memory.set(encoded, pointer)
        const status = exports.avm_run(pointer, encoded.byteLength, LIMITS.instructionCount)
        const outputLength = exports.avm_output_length()
        const output = new Uint8Array(exports.memory.buffer).slice(exports.avm_output(), exports.avm_output() + Math.min(outputLength, LIMITS.outputBytes))
        return { ok: status === 0, status, output: new TextDecoder().decode(output) }
      },
    }
  } catch (error) {
    return { kind: 'wasm', available: false, run: async () => ({ ok: false, error: `module load failed: ${String(error?.message ?? error)}` }) }
  }
}
