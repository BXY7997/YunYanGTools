# ER Diagram Tool

## Purpose
- Convert SQL or structured text into editable ER diagrams.
- Keep front-end generation/export closed-loop while reserving backend integration points.

## Module Structure
- `components/workspace`: workspace UI entry and composition.
- `constants`: preset and static config.
- `services`: API adapter and runtime contract.
- `types`: tool-level types.

## Runtime
- Runtime contract export: `erDiagramRuntimeContract`.
- Generate/export/sync/load contract is standardized by shared tool runtime.
