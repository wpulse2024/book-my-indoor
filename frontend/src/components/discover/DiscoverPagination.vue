<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ totalPages: number }>()
const current = defineModel<number>({ default: 1 })

const pages = computed(() => {
  const total = props.totalPages
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const c = current.value
  if (c <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (c >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', c - 1, c, c + 1, '...', total]
})

function prev() { if (current.value > 1) current.value-- }
function next() { if (current.value < props.totalPages) current.value++ }
</script>

<template>
  <div class="flex flex-col items-center gap-4 mt-8">
    <!-- Pagination -->
    <div class="flex items-center gap-1">
      <!-- Prev -->
      <button
        @click="prev"
        :disabled="current === 1"
        class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <template v-for="page in pages" :key="page">
        <span v-if="page === '...'" class="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">...</span>
        <button
          v-else
          @click="current = Number(page)"
          :class="[
            'w-8 h-8 rounded-lg text-sm font-bold transition-all',
            current === page
              ? 'bg-blue-700 text-white shadow'
              : 'border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700'
          ]"
        >
          {{ page }}
        </button>
      </template>

      <!-- Next -->
      <button
        @click="next"
        :disabled="current === totalPages"
        class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>
