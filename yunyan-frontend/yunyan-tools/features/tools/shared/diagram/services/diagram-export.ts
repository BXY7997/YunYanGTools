import {
  buildDiagramSvgMarkup,
} from "@/features/tools/shared/diagram/services/diagram-render-svg"
import type {
  DiagramExportRequest,
  DiagramRenderConfig,
} from "@/features/tools/shared/diagram/types/diagram"

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

async function svgToPngBlob(svgMarkup: string, width: number, height: number) {
  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error("SVG 渲染失败"))
      img.src = url
    })

    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.ceil(width))
    canvas.height = Math.max(1, Math.ceil(height))

    const context = canvas.getContext("2d")
    if (!context) {
      throw new Error("无法创建 Canvas 上下文")
    }

    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((nextBlob) => {
        if (!nextBlob) {
          reject(new Error("图片导出失败"))
          return
        }
        resolve(nextBlob)
      }, "image/png")
    })

    return pngBlob
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function exportDiagramDocument(
  request: DiagramExportRequest,
  tone: "sky" | "emerald" | "amber" | "violet" | "slate",
  runtimeConfig: DiagramRenderConfig
) {
  const svgMarkup = buildDiagramSvgMarkup(request.document, runtimeConfig, tone)

  if (request.format === "svg") {
    const svgBlob = new Blob([svgMarkup], {
      type: "image/svg+xml;charset=utf-8",
    })
    triggerDownload(svgBlob, `${request.fileName}.svg`)
    return
  }

  const pngBlob = await svgToPngBlob(
    svgMarkup,
    request.document.width,
    request.document.height
  )
  triggerDownload(pngBlob, `${request.fileName}.png`)
}
