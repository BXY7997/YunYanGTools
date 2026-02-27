import * as React from "react"

export function useAbortableTask() {
  const abortRef = React.useRef<AbortController | null>(null)

  const createController = React.useCallback(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    return controller
  }, [])

  const abort = React.useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const isAbortError = React.useCallback((error: unknown) => {
    return error instanceof Error && error.name === "AbortError"
  }, [])

  React.useEffect(
    () => () => {
      abortRef.current?.abort()
    },
    []
  )

  return {
    abortRef,
    createController,
    abort,
    isAbortError,
  }
}

