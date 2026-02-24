"use strict"

module.exports = {
  docs: {
    baseline: {
      file: "docs/standards/word-export-baseline.md",
      tokens: [
        "# Word 导出规范基线",
        "## 回归守护（必须通过）",
        "1. 长文本场景：",
        "2. 多列表场景：",
        "3. 空值场景：",
        "4. 超宽表场景：",
        "5. 对齐模式场景：",
      ],
    },
    modules: {
      file: "docs/standards/tools-modules.md",
      tokens: [
        "word-export-baseline.md",
        "更新基线文档与回归脚本中的场景快照断言",
      ],
    },
  },
  shared: [
    {
      scope: "alignment-shared-type",
      file: "features/tools/shared/types/word-export.ts",
      tokens: ['export type WordCellAlignmentMode = "standard" | "all-center"'],
    },
    {
      scope: "alignment-shared-const",
      file: "features/tools/shared/constants/word-export.ts",
      tokens: [
        "defaultWordCellAlignmentMode",
        "wordCellAlignmentOptions",
        'value: "standard"',
        'value: "all-center"',
        "论文标准对齐",
        "全部居中",
      ],
    },
    {
      scope: "export-preset-const",
      file: "features/tools/shared/constants/word-export-presets.ts",
      tokens: [
        "wordExportPresetPackages",
        "thesis-standard",
        "enterprise-report",
        "defaultWordExportPresetId",
      ],
    },
    {
      scope: "draft-schema-const",
      file: "features/tools/shared/constants/draft-schema.ts",
      tokens: ["toolDraftSchemaVersions", "useCaseDoc", "sqlToTable"],
    },
    {
      scope: "orientation-engine",
      file: "features/tools/shared/services/word-export-engine.ts",
      tokens: ['landscape: "297mm 210mm"', "resolveWordPageOrientation"],
    },
    {
      scope: "alignment-control-component",
      file: "features/tools/shared/components/word-export-controls.tsx",
      tokens: [
        "WordCellAlignmentSelector",
        "wordCellAlignmentOptions.map((option) =>",
        "onValueChange(next as WordCellAlignmentMode)",
      ],
    },
    {
      scope: "word-export-config-panel",
      file: "features/tools/shared/components/word-export-config-panel.tsx",
      tokens: [
        "WordExportConfigPanel",
        "WordCellAlignmentSelector",
        "wordOrientationOptions.map((option) =>",
      ],
    },
  ],
  modules: [
    {
      id: "use-case-doc",
      typeFile: "features/tools/use-case-doc/types/use-case-doc.ts",
      workspaceFile:
        "features/tools/use-case-doc/components/use-case-doc-workspace.tsx",
      exportFile:
        "features/tools/use-case-doc/services/use-case-doc-word-export.ts",
      precheckFile:
        "features/tools/use-case-doc/services/use-case-doc-export-precheck.ts",
      workspaceTokens: [
        'storageKey: "tools:draft:use-case-doc:alignment:v1"',
        "schemaVersion: toolDraftSchemaVersions.useCaseDoc",
        "WordExportConfigPanel",
        'idPrefix="use-case"',
        "getUseCaseDocExportPrecheckNotices(",
        "presetId: exportPresetId",
        "alignmentMode",
      ],
      exportTokens: [
        "const preset = resolveWordExportPreset(payload.presetId)",
        "payload.alignmentMode || preset.defaultAlignmentMode",
        'options.alignmentMode === "all-center" ? "center" : "left"',
        'options.alignmentMode === "all-center" ? "middle" : "top"',
      ],
      precheckTokens: [
        'if (alignmentMode === "all-center")',
        "论文",
      ],
    },
    {
      id: "test-doc",
      typeFile: "features/tools/test-doc/types/test-doc.ts",
      workspaceFile: "features/tools/test-doc/components/test-doc-workspace.tsx",
      exportFile: "features/tools/test-doc/services/test-doc-word-export.ts",
      precheckFile: "features/tools/test-doc/services/test-doc-export-precheck.ts",
      workspaceTokens: [
        'storageKey: "tools:draft:test-doc:alignment:v1"',
        "schemaVersion: toolDraftSchemaVersions.testDoc",
        "WordExportConfigPanel",
        'idPrefix="test-doc"',
        "getTestDocExportPrecheckNotices(",
        "presetId: exportPresetId",
        "alignmentMode",
      ],
      exportTokens: [
        "const preset = resolveWordExportPreset(payload.presetId)",
        "payload.alignmentMode || preset.defaultAlignmentMode",
        'options.alignmentMode === "all-center" ? "center" : "left"',
        'options.alignmentMode === "all-center" ? "middle" : "top"',
      ],
      precheckTokens: [
        'if (alignmentMode === "all-center")',
        "论文",
      ],
    },
    {
      id: "sql-to-table",
      typeFile: "features/tools/sql-to-table/types/sql-to-table.ts",
      workspaceFile:
        "features/tools/sql-to-table/components/sql-to-table-workspace.tsx",
      exportFile:
        "features/tools/sql-to-table/services/sql-to-table-word-export.ts",
      precheckFile:
        "features/tools/sql-to-table/services/sql-to-table-export-precheck.ts",
      workspaceTokens: [
        'storageKey: "tools:draft:sql-to-table:alignment:v1"',
        "schemaVersion: toolDraftSchemaVersions.sqlToTable",
        "WordExportConfigPanel",
        'idPrefix="sql"',
        "getSqlToTableExportPrecheckNotices({",
        "presetId: exportPresetId",
        "alignmentMode",
        "resolveSqlToTablePreviewCellAlign(",
        "parseSqlSchemaToTablesWithWorker(",
      ],
      exportTokens: [
        "const preset = resolveWordExportPreset(payload.presetId)",
        "payload.alignmentMode || preset.defaultAlignmentMode",
        "resolveSqlToTableColumnLayout",
        "alignmentMode || \"standard\"",
      ],
      precheckTokens: [
        'if (alignmentMode === "all-center")',
        "论文",
      ],
    },
    {
      id: "word-table",
      typeFile: "features/tools/word-table/types/word-table.ts",
      workspaceFile:
        "features/tools/word-table/components/word-table-workspace.tsx",
      exportFile:
        "features/tools/word-table/services/word-table-word-export.ts",
      precheckFile:
        "features/tools/word-table/services/word-table-export-precheck.ts",
      workspaceTokens: [
        'storageKey: "tools:draft:word-table:alignment:v1"',
        "schemaVersion: toolDraftSchemaVersions.wordTable",
        "WordExportConfigPanel",
        'idPrefix="word-table"',
        "getWordTableExportPrecheckNotices(",
        "presetId: exportPresetId",
        "alignmentMode",
      ],
      exportTokens: [
        "const preset = resolveWordExportPreset(payload.presetId)",
        "payload.alignmentMode || preset.defaultAlignmentMode",
        'const bodyTextAlign = alignmentMode === "all-center" ? "center" : "left"',
        'const bodyVerticalAlign = alignmentMode === "all-center" ? "middle" : "top"',
      ],
      precheckTokens: [
        'if (alignmentMode === "all-center")',
        "论文",
      ],
    },
    {
      id: "pseudo-code",
      typeFile: "features/tools/pseudo-code/types/pseudo-code.ts",
      workspaceFile:
        "features/tools/pseudo-code/components/pseudo-code-workspace.tsx",
      exportFile:
        "features/tools/pseudo-code/services/pseudo-code-word-export.ts",
      precheckFile:
        "features/tools/pseudo-code/services/pseudo-code-export-precheck.ts",
      workspaceTokens: [
        'storageKey: "tools:draft:pseudo-code:image-export-format:v1"',
        "exportPseudoCodeWord(",
        "createPseudoCodeWordFileName(",
        "triggerPseudoCodeWordDownload(",
      ],
      exportTokens: [
        "const algorithmCaption =",
        "font-family:'Consolas','Courier New',monospace",
        "border-top:${styleSpec.topRulePt}pt solid #000",
        "assertWordExportHtml",
      ],
      precheckTokens: [
        "论文提交",
        "document.renderConfig.indentSize >= 5",
      ],
    },
  ],
  scenarios: [
    {
      name: "long-text",
      assertions: [
        {
          file: "features/tools/use-case-doc/services/use-case-doc-word-export.ts",
          tokens: ["word-break:break-word", "overflow-wrap:anywhere"],
        },
        {
          file: "features/tools/test-doc/services/test-doc-word-export.ts",
          tokens: ["word-break:break-word", "overflow-wrap:anywhere"],
        },
        {
          file: "features/tools/sql-to-table/services/sql-to-table-word-export.ts",
          tokens: [
            'word-break:${layout.wordBreak || "break-word"}',
            "overflow-wrap:anywhere",
          ],
        },
        {
          file: "features/tools/word-table/services/word-table-word-export.ts",
          tokens: ["word-break:break-word", "overflow-wrap:anywhere"],
        },
        {
          file:
            "features/tools/pseudo-code/services/pseudo-code-word-export.ts",
          tokens: ["word-break:break-word", "overflow-wrap:anywhere"],
        },
      ],
    },
    {
      name: "multi-column",
      assertions: [
        {
          file: "features/tools/test-doc/services/test-doc-word-export.ts",
          tokens: ["<colgroup>", "testDocCaseColumnSpecs", "buildCaseColumnGroup"],
        },
        {
          file: "features/tools/word-table/services/word-table-word-export.ts",
          tokens: ["<colgroup>", "buildWordTableColumnWidths", "table-layout:fixed"],
        },
        {
          file: "features/tools/sql-to-table/services/sql-to-table-word-export.ts",
          tokens: [
            "resolveSqlToTableColumnLayout",
            "table-layout:auto",
            "width:${layout.width}",
          ],
        },
      ],
    },
    {
      name: "empty-value",
      assertions: [
        {
          file: "features/tools/use-case-doc/services/use-case-doc-word-export.ts",
          tokens: ['<p style="margin:0;line-height:1.5;">无</p>'],
        },
        {
          file: "features/tools/test-doc/services/test-doc-word-export.ts",
          tokens: ['return "无"', 'return "—"'],
        },
        {
          file: "features/tools/sql-to-table/services/sql-to-table-word-export.ts",
          tokens: ["无字段数据", "styleSpec.bodyCellFallback"],
        },
        {
          file: "features/tools/word-table/services/word-table-word-export.ts",
          tokens: ['return "&#8212;"'],
        },
      ],
    },
    {
      name: "wide-table",
      assertions: [
        {
          file: "features/tools/test-doc/services/test-doc-word-export.ts",
          tokens: [
            "shouldUseLandscapeForTestDoc(document)",
            '? "landscape"',
            "resolveWordPageOrientation",
          ],
        },
        {
          file: "features/tools/sql-to-table/services/sql-to-table-word-export.ts",
          tokens: [
            "shouldUseLandscapePage(columns)",
            '? "landscape"',
            "resolveWordPageOrientation",
          ],
        },
        {
          file: "features/tools/word-table/services/word-table-word-export.ts",
          tokens: [
            "shouldUseLandscapeForWordTable(document)",
            '? "landscape"',
            "resolveWordPageOrientation",
          ],
        },
        {
          file: "features/tools/test-doc/services/test-doc-export-precheck.ts",
          tokens: ["检测到宽表内容"],
        },
        {
          file: "features/tools/sql-to-table/services/sql-to-table-export-precheck.ts",
          tokens: ["检测到宽表内容"],
        },
        {
          file: "features/tools/word-table/services/word-table-export-precheck.ts",
          tokens: ["检测到宽表内容"],
        },
      ],
    },
  ],
  exportGuardRegexChecks: [
    {
      scope: "export-guard-use-case",
      file: "features/tools/use-case-doc/services/use-case-doc-word-export.ts",
      pattern: /assertWordExportHtml\([\s\S]*requiredTokens:\s*\[[\s\S]*<table[\s\S]*\]/,
      tip: "use-case export must keep required token guard",
    },
    {
      scope: "export-guard-test-doc",
      file: "features/tools/test-doc/services/test-doc-word-export.ts",
      pattern: /assertWordExportHtml\([\s\S]*requiredTokens:\s*\[[\s\S]*<table[\s\S]*\]/,
      tip: "test-doc export must keep required token guard",
    },
    {
      scope: "export-guard-sql",
      file: "features/tools/sql-to-table/services/sql-to-table-word-export.ts",
      pattern: /assertWordExportHtml\([\s\S]*requiredTokens:\s*\[[\s\S]*<table[\s\S]*\]/,
      tip: "sql export must keep required token guard",
    },
    {
      scope: "export-guard-word-table",
      file: "features/tools/word-table/services/word-table-word-export.ts",
      pattern: /assertWordExportHtml\([\s\S]*requiredTokens:\s*\[[\s\S]*<table[\s\S]*\]/,
      tip: "word-table export must keep required token guard",
    },
    {
      scope: "export-guard-pseudo-code",
      file: "features/tools/pseudo-code/services/pseudo-code-word-export.ts",
      pattern: /assertWordExportHtml\([\s\S]*requiredTokens:\s*\[[\s\S]*Consolas[\s\S]*\]/,
      tip: "pseudo-code export must keep required token guard",
    },
  ],
}
