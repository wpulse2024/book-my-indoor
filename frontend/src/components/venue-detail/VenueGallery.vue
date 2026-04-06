<script setup lang="ts">
defineProps<{
  badge?: string
  images: string[]
}>()
</script>

<template>
  <div class="grid grid-cols-3 gap-2" style="height: 400px;">
    <!-- Main large image -->
    <div class="col-span-1 relative rounded-xl overflow-hidden" style="grid-column: span 1;">
      <img :src="images[0]" alt="venue" class="w-full h-full object-cover" />
      <span v-if="badge" class="absolute top-3 left-3 bg-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wide">
        {{ badge }}
      </span>
    </div>

    <!-- 2x2 grid right -->
    <div class="col-span-2 grid grid-cols-2 grid-rows-2 gap-2">
      <div v-for="(img, i) in images.slice(1, 5)" :key="i" class="relative rounded-xl overflow-hidden">
        <img :src="img" alt="venue" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" />
        <!-- Last tile: +12 Photos overlay -->
        <div
          v-if="i === 3"
          class="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors"
        >
          <span class="text-white font-black text-lg">+12 Photos</span>
        </div>
      </div>
    </div>
  </div>
</template>
