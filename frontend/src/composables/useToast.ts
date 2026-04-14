import { ref } from 'vue'

export type ToastType = 'success' | 'error'

export interface Toast {
  id: number
  message: string
  type: ToastType
}

// Module-level shared state — one list for the whole app
const toasts = ref<Toast[]>([])
let _nextId = 0

export function useToast() {
  function show(message: string, type: ToastType = 'success', duration = 3000) {
    const id = ++_nextId
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  return {
    toasts,
    success: (msg: string) => show(msg, 'success'),
    error:   (msg: string) => show(msg, 'error'),
  }
}
