<script setup lang="ts">
const sortOptions = ['Near Me', 'Price Low to High', 'Top Rated']
const activeSort = defineModel<string>('sort', { default: 'Near Me' })
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
    <div>
      <h1 class="font-black text-gray-900 text-3xl leading-tight">Discover Venues</h1>
      <p class="text-gray-400 text-sm mt-1">Found 24 elite venues near New York</p>
    </div>

    <!-- Sort tabs -->
    <div class="flex items-center gap-2 flex-shrink-0">
      <button
        v-for="opt in sortOptions"
        :key="opt"
        @click="activeSort = opt"
        :class="[
          'px-4 py-2 rounded-xl text-sm font-semibold border transition-all whitespace-nowrap',
          activeSort === opt
            ? 'bg-blue-700 text-white border-blue-700 shadow'
            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
        ]"
      >
        {{ opt }}
      </button>
    </div>
  </div>
</template>
