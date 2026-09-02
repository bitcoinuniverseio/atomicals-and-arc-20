# UTXO safety planning

Use the planner in packages/utxo-planner and the UTXO Safety Planner page.
Rules that matter most: coloured satoshis spent as fees or change burn
permanently; unknown assignment state stays unknown and must never be called
safe; receiver outputs come before change. Every warning cites its rule page
and pinned source path. Explain the specific risk and the safe alternative.
