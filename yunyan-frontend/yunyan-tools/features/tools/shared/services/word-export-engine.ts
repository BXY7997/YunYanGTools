import type {
  WordPageOrientation,
  WordPageOrientationMode,
} from "@/features/tools/shared/types/word-export"

interface WordHtmlOptions {
  title: string
  bodyHtml: string
  orientation?: WordPageOrientation
  pageMargin?: string
  headerMargin?: string
  footerMargin?: string
  baseFontFamily?: string
  baseFontSizePt?: number
  baseLineHeight?: number
  extraStyles?: string
}

const pageSizeByOrientation: Record<WordPageOrientation, string> = {
  portrait: "210mm 297mm",
  landscape: "297mm 210mm",
}

export function resolveWordPageOrientation(
  mode: WordPageOrientationMode | undefined,
  autoOrientation: WordPageOrientation
): WordPageOrientation {
  if (mode === "portrait" || mode === "landscape") {
    return mode
  }
  return autoOrientation
}

export function createWordHtmlDocument({
  title,
  bodyHtml,
  orientation = "portrait",
  pageMargin = "2.54cm 3.17cm 2.54cm 3.17cm",
  headerMargin = "1.5cm",
  footerMargin = "1.75cm",
  baseFontFamily = '"宋体", "SimSun", serif',
  baseFontSizePt = 10.5,
  baseLineHeight = 1.5,
  extraStyles,
}: WordHtmlOptions) {
  const pageSize = pageSizeByOrientation[orientation]

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <title>${title}</title>
  <style>
    @page {
      size: ${pageSize};
      margin: ${pageMargin};
      mso-header-margin: ${headerMargin};
      mso-footer-margin: ${footerMargin};
    }

    body {
      margin: 0;
      padding: 0;
      color: #000;
      font-family: ${baseFontFamily};
      font-size: ${baseFontSizePt}pt;
      line-height: ${baseLineHeight};
      mso-pagination: widow-orphan;
      word-break: break-word;
      overflow-wrap: anywhere;
    }

    ${extraStyles || ""}
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`
}

export function createWordDocumentBlob(html: string) {
  return new Blob(["\ufeff", html], {
    type: "application/msword;charset=utf-8",
  })
}
