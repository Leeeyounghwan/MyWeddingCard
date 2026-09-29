import { useSyncExternalStore } from 'react'

export interface ToastState {
  id: number
  message: string
}

let current: ToastState | null = null
let seq = 0
let timer: number | undefined
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((l) => l())

/** 화면 하단에 짧은 안내 메시지를 띄웁니다. */
export function toast(message: string, duration = 2200) {
  current = { id: ++seq, message }
  emit()
  window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    current = null
    emit()
  }, duration)
}

export function useToast(): ToastState | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => current,
    () => null,
  )
}
