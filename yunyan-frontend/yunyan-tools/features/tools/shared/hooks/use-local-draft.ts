"use client"

import * as React from "react"

interface UseLocalDraftStateOptions<T> {
  storageKey: string
  initialValue: T
  syncDelayMs?: number
  schemaVersion?: number
  migrate?: (legacyValue: unknown, legacyVersion: number) => T
}

interface DraftEnvelope<T> {
  schemaVersion: number
  value: T
}

interface DraftReadResult<T> {
  value: T | null
  version: number
}

const useClientLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

function readLocalDraft<T>(storageKey: string): DraftReadResult<T> | null {
  if (typeof window === "undefined") {
    return null
  }

  const raw = window.localStorage.getItem(storageKey)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    if (
      parsed &&
      typeof parsed === "object" &&
      "schemaVersion" in parsed &&
      "value" in parsed
    ) {
      const envelope = parsed as DraftEnvelope<T>
      const version =
        typeof envelope.schemaVersion === "number" ? envelope.schemaVersion : 1
      return {
        value: envelope.value,
        version,
      }
    }

    return {
      value: parsed as T,
      version: 0,
    }
  } catch {
    return null
  }
}

export function useLocalDraftState<T>({
  storageKey,
  initialValue,
  syncDelayMs = 150,
  schemaVersion = 1,
  migrate,
}: UseLocalDraftStateOptions<T>) {
  const [value, setValue] = React.useState<T>(initialValue)
  const [isHydrated, setIsHydrated] = React.useState(false)
  const migrateRef = React.useRef(migrate)

  React.useEffect(() => {
    migrateRef.current = migrate
  }, [migrate])

  useClientLayoutEffect(() => {
    const saved = readLocalDraft<T>(storageKey)
    if (saved !== null && saved.value !== null) {
      let nextValue: T
      if (saved.version === schemaVersion) {
        nextValue = saved.value
      } else {
        const migrated = migrateRef.current
          ? migrateRef.current(saved.value, saved.version)
          : (saved.value as T)
        nextValue = migrated
      }

      setValue((previousValue) =>
        Object.is(previousValue, nextValue) ? previousValue : nextValue
      )
    }
    setIsHydrated(true)
  }, [schemaVersion, storageKey])

  React.useEffect(() => {
    if (!isHydrated || typeof window === "undefined") {
      return
    }

    const timeoutId = window.setTimeout(() => {
      try {
        const envelope: DraftEnvelope<T> = {
          schemaVersion,
          value,
        }
        window.localStorage.setItem(storageKey, JSON.stringify(envelope))
      } catch {
        // 忽略本地存储异常，避免影响主要业务流程。
      }
    }, syncDelayMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isHydrated, schemaVersion, storageKey, syncDelayMs, value])

  const clearDraft = React.useCallback(() => {
    setValue(initialValue)
    if (typeof window === "undefined") {
      return
    }
    window.localStorage.removeItem(storageKey)
  }, [initialValue, storageKey])

  return {
    value,
    setValue,
    clearDraft,
    isHydrated,
  }
}
