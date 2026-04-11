<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  badge?: string
  images: string[]
}>()

// Pad to at least 5 images with a grey placeholder so the grid never looks broken
const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3Crect width="1" height="1" fill="%23e5e7eb"/%3E%3C/svg%3E'

const padded = computed(() => {
  const imgs = [...props.images]
  while (imgs.length < 5) imgs.push(PLACEHOLDER)
  return imgs
})

const singleImage = computed(() => props.images.length === 1)
</script>

<template>
  <!-- Single image: full width -->
  <div v-if="singleImage" class="relative rounded-xl overflow-hidden" style="height: 400px;">
    <img :src="images[0]" alt="venue" class="w-full h-full object-cover" />
    <span v-if="badge" class="absolute top-3 left-3 bg-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wide">
      {{ badge }}
    </span>
  </div>

  <!-- Multiple images: 1/3 + 2/3 grid -->
  <div v-else class="grid grid-cols-3 gap-2" style="height: 400px;">
    <!-- Main large image -->
    <div class="col-span-1 relative rounded-xl overflow-hidden">
      <img :src="padded[0]" alt="venue" class="w-full h-full object-cover" />
      <span v-if="badge" class="absolute top-3 left-3 bg-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wide">
        {{ badge }}
      </span>
    </div>

    <!-- 2×2 grid right -->
    <div class="col-span-2 grid grid-cols-2 grid-rows-2 gap-2">
      <div v-for="(img, i) in padded.slice(1, 5)" :key="i" class="relative rounded-xl overflow-hidden">
        <img
          :src="img"
          alt="venue"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
        />
        <!-- +N Photos overlay on last tile if more than 5 images -->
        <div
          v-if="i === 3 && images.length > 5"
          class="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors"
        >
          <span class="text-white font-black text-lg">+{{ images.length - 5 }} Photos</span>
        </div>
      </div>
    </div>
  </div>
</template>
