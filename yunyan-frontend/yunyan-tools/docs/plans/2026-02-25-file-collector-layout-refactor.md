# File Collector Layout Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the `file-collector` workspace into a high-fidelity competitor-style layout with a sticky process navigation sidebar and sectioned operations center.

**Architecture:** Keep the existing module/service boundaries (`constants/services/types`) and fully refactor the workspace presentation layer. Preserve local-first matching/export business logic while replacing generic shell composition with a custom section-driven page layout. Maintain route/runtime/backend registry integration already in place.

**Tech Stack:** Next.js App Router, React 18, TypeScript, Tailwind CSS, existing tools shared runtime/hooks/services.

---

### Task 1: Confirm current constraints and target layout skeleton

**Files:**
- Read: `features/tools/file-collector/components/file-collector-workspace.tsx`
- Read: `features/tools/shared/components/tool-workspace-shell.tsx`
- Read: `components/tools/tools-shell.tsx`

**Step 1: Capture existing interaction contracts**
- Ensure current handlers remain: analyze, export(3 formats), reminder copy, reset, drag-drop file import.

**Step 2: Define layout sections**
- `S1`: 收集配置
- `S2`: 文件上传
- `S3`: 提交台账与风险
- `S4`: 导出与催交

**Step 3: Define sidebar nav anchors**
- Build sticky left nav with section links and progress chips from current summary.

### Task 2: Rewrite workspace UI into competitor-style structure

**Files:**
- Modify: `features/tools/file-collector/components/file-collector-workspace.tsx`

**Step 1: Extract small render helpers**
- Add `SubmissionRow`, status badge helpers, file size/time formatters.

**Step 2: Replace current two-column generic layout**
- Implement page frame:
  - Header hero
  - Main grid: `aside` process nav + `main` section stack
  - Section cards with stronger visual hierarchy

**Step 3: Keep all actions wired**
- Rebind buttons and inputs to existing handlers/state.
- Keep telemetry and workspace header status updates unchanged semantically.

**Step 4: Preserve accessibility and responsive behavior**
- Proper headings, `aria-current` for nav links, mobile-first stacking.

### Task 3: Tighten styling and interaction details

**Files:**
- Modify: `features/tools/file-collector/components/file-collector-workspace.tsx`

**Step 1: Improve section affordances**
- Sticky process nav, step badges, risk cards, quick export action group.

**Step 2: Add deterministic visual state cues**
- Status chips for on-time/late/unmatched.
- Highlight pending/unmatched counts in summary cards.

**Step 3: Keep style tokens consistent**
- Reuse existing `toolsWorkspaceLayout` and shadcn/tailwind utility conventions.

### Task 4: Validate and fix lint/admission regressions

**Files:**
- Validate: `features/tools/file-collector/components/file-collector-workspace.tsx`
- Validate: module wiring files already touched for file-collector

**Step 1: Run module admission**
- Run: `node scripts/check-tool-module-admission.js`

**Step 2: Run targeted lint**
- Run: `pnpm exec next lint --file "features/tools/file-collector/components/file-collector-workspace.tsx"`

**Step 3: Fix reported issues**
- Tailwind ordering/shorthand and any rule violations.

**Step 4: Re-run checks until green**
- Confirm no new warnings/errors for modified files.
