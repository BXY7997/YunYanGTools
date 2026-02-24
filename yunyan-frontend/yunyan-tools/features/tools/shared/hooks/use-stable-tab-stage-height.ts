import * as React from "react"

type TabStagePanel = "first" | "second"

export function useStableTabStageHeight(
  firstPanelRef: React.RefObject<HTMLDivElement | null>,
  secondPanelRef: React.RefObject<HTMLDivElement | null>,
  activePanel: TabStagePanel,
  minHeight = 0
) {
  const [panelHeights, setPanelHeights] = React.useState<{
    first: number
    second: number
  }>({
    first: 0,
    second: 0,
  })

  React.useEffect(() => {
    const updateHeights = () => {
      setPanelHeights({
        first: firstPanelRef.current?.offsetHeight ?? 0,
        second: secondPanelRef.current?.offsetHeight ?? 0,
      })
    }

    let rafId = window.requestAnimationFrame(updateHeights)

    if (typeof ResizeObserver === "undefined") {
      return () => {
        window.cancelAnimationFrame(rafId)
      }
    }

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(rafId)
      rafId = window.requestAnimationFrame(updateHeights)
    }

    const observer = new ResizeObserver(scheduleUpdate)

    if (firstPanelRef.current) {
      observer.observe(firstPanelRef.current)
    }
    if (secondPanelRef.current) {
      observer.observe(secondPanelRef.current)
    }

    return () => {
      window.cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [firstPanelRef, secondPanelRef])

  const activeHeight =
    activePanel === "first" ? panelHeights.first : panelHeights.second
  const fallbackHeight = Math.max(panelHeights.first, panelHeights.second)
  const nextHeight = Math.max(minHeight, activeHeight || fallbackHeight)

  return nextHeight > 0 ? nextHeight : null
}
