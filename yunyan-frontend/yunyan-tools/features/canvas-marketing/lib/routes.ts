export const CANVAS_BASE_PATH = "/canvas"

function isExternalHref(href: string) {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  )
}

export function toCanvasHref(href: string) {
  if (!href) {
    return CANVAS_BASE_PATH
  }

  if (href.startsWith("#") || isExternalHref(href)) {
    return href
  }

  if (href === "/") {
    return CANVAS_BASE_PATH
  }

  if (href.startsWith(CANVAS_BASE_PATH)) {
    return href
  }

  if (href.startsWith("/")) {
    return `${CANVAS_BASE_PATH}${href}`
  }

  return href
}

