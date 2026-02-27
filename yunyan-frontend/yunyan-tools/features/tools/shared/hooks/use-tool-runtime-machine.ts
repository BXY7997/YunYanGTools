"use client"

import * as React from "react"

import type { ToolRuntimeActionStage } from "@/features/tools/shared/types/tool-runtime"

interface ToolRuntimeMachineState<TNoticeTone extends string = "info" | "success" | "error"> {
  stage: ToolRuntimeActionStage
  notice: {
    tone: TNoticeTone
    text: string
  }
  lastUpdatedAt: Date
}

interface UseToolRuntimeMachineOptions<TNoticeTone extends string = "info" | "success" | "error"> {
  initialNotice: {
    tone: TNoticeTone
    text: string
  }
}

export function useToolRuntimeMachine<TNoticeTone extends string = "info" | "success" | "error">({
  initialNotice,
}: UseToolRuntimeMachineOptions<TNoticeTone>) {
  const [state, setState] = React.useState<ToolRuntimeMachineState<TNoticeTone>>({
    stage: "idle",
    notice: initialNotice,
    lastUpdatedAt: new Date(),
  })

  const transition = React.useCallback(
    (
      stage: ToolRuntimeActionStage,
      notice?: {
        tone: TNoticeTone
        text: string
      }
    ) => {
      setState((previous) => ({
        stage,
        notice: notice || previous.notice,
        lastUpdatedAt: new Date(),
      }))
    },
    []
  )

  const markBusy = React.useCallback(
    (stage: Extract<ToolRuntimeActionStage, "loading" | "generating" | "exporting" | "syncing" | "running">) => {
      transition(stage)
    },
    [transition]
  )

  const markSuccess = React.useCallback(
    (text: string, tone = "success" as TNoticeTone) => {
      transition("idle", { tone, text })
    },
    [transition]
  )

  const markError = React.useCallback(
    (text: string, tone = "error" as TNoticeTone) => {
      transition("error", { tone, text })
    },
    [transition]
  )

  const reset = React.useCallback(() => {
    transition("idle", initialNotice)
  }, [initialNotice, transition])

  return {
    state,
    transition,
    markBusy,
    markSuccess,
    markError,
    reset,
    isBusy:
      state.stage === "loading" ||
      state.stage === "generating" ||
      state.stage === "exporting" ||
      state.stage === "syncing" ||
      state.stage === "running",
  }
}
