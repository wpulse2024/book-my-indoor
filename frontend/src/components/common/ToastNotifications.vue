<script setup lang="ts">
import { useToast } from '@/composables/useToast'
const { toasts } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-2 scale-95"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold pointer-events-auto min-w-[220px] max-w-xs"
          :class="toast.type === 'success'
            ? 'bg-gray-900 text-white'
            : 'bg-red-600 text-white'"
        >
          <!-- Icon -->
          <span v-if="toast.type === 'success'" class="flex-shrink-0 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
            </svg>
          </span>
          <span v-else class="flex-shrink-0 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </span>

          <span class="leading-snug">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
