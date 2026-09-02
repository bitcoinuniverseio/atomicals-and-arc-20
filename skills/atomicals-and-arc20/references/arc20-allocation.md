# ARC-20 allocation reasoning

The rules live in packages/protocol-core/src/allocation.mjs, implemented from
Atomicals ElectrumX v1.5.2.0. Execute, do not approximate:

```
node -e "import('./packages/protocol-core/src/allocation.mjs').then(m => {
  const result = m.allocate(
    [{ value: 700 }, { value: 500 }],
    [{ atomicalId: 'TOKEN', txinIndex: 0, atomicalValue: 1200 }],
    { sortByFifo: true },
  )
  console.log(JSON.stringify(result, null, 2))
})"
```

Explain results with the rule pages: /protocol/arc20/allocation/ for ordering
and assignment, /protocol/arc20/burns/ for burn behaviour. Conformance vectors
in conformance/vectors are executed in CI; cite them when a caller disputes a
result.
