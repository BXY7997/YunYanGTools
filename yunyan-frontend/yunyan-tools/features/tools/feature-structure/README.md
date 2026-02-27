# Feature Structure Tool

## Purpose
- Generate thesis-style feature-structure diagrams with strict layout rules.
- Support local-first generation, canvas editing, export, and cloud-sync placeholder.

## Module Structure
- `components/workspace`: left/canvas/right split workspace implementation.
- `constants`: config, limits, contract constants.
- `services`: generation, layout, export, runtime contract.
- `types`: feature-structure specific model types.

## Runtime
- Runtime contract export: `featureStructureRuntimeContract`.
- Supports `generate/export/sync/load` standard runtime actions.
