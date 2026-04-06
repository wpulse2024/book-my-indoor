<script setup lang="ts">
import { ref } from 'vue'

const current = ref(1)
const total = 12

const pages = [1, 2, 3, '...', 12]
</script>

<template>
  <div class="flex flex-col items-center gap-4 mt-8">
    <button class="text-blue-700 font-black text-sm hover:underline">
      Load More Venues
    </button>

    <!-- Pagination -->
    <div class="flex items-center gap-1">
      <!-- Prev -->
      <button class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-700 transition-colors">
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
      <button class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-700 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>
