<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  badge?: string
  images: string[]
}>()

const count = computed(() => props.images.length)
</script>

<template>
  <!-- 1 image: full width -->
  <div
    v-if="count === 1"
    class="relative rounded-xl overflow-hidden"
    style="height: 420px;"
  >
    <img :src="images[0]" alt="venue" class="w-full h-full object-cover" />
    <span v-if="badge" class="absolute top-3 left-3 bg-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wide">
      {{ badge }}
    </span>
  </div>

  <!-- 2 images: side by side -->
  <div
    v-else-if="count === 2"
    class="grid grid-cols-2 gap-2 overflow-hidden rounded-xl"
    style="height: 420px;"
  >
    <div v-for="(img, i) in images" :key="i" class="relative overflow-hidden rounded-xl" style="height: 420px;">
      <img :src="img" alt="venue" class="w-full h-full object-cover" />
      <span v-if="i === 0 && badge" class="absolute top-3 left-3 bg-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wide">
        {{ badge }}
      </span>
    </div>
  </div>

  <!-- 3 images: left tall + right 2 stacked -->
  <div
    v-else-if="count === 3"
    class="grid grid-cols-2 gap-2 overflow-hidden"
    style="height: 420px;"
  >
    <div class="relative rounded-xl overflow-hidden" style="height: 420px;">
      <img :src="images[0]" alt="venue" class="w-full h-full object-cover" />
      <span v-if="badge" class="absolute top-3 left-3 bg-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wide">
        {{ badge }}
      </span>
    </div>
    <div class="flex flex-col gap-2" style="height: 420px;">
      <div class="relative rounded-xl overflow-hidden flex-1" style="min-height: 0;">
        <img :src="images[1]" alt="venue" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" />
      </div>
      <div class="relative rounded-xl overflow-hidden flex-1" style="min-height: 0;">
        <img :src="images[2]" alt="venue" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" />
      </div>
    </div>
  </div>

  <!-- 4+ images: left tall + right 2×2 grid -->
  <div
    v-else
    class="grid grid-cols-3 gap-2 overflow-hidden"
    style="height: 420px;"
  >
    <div class="relative rounded-xl overflow-hidden" style="height: 420px;">
      <img :src="images[0]" alt="venue" class="w-full h-full object-cover" />
      <span v-if="badge" class="absolute top-3 left-3 bg-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wide">
        {{ badge }}
      </span>
    </div>
    <div class="col-span-2 grid grid-cols-2 gap-2" style="height: 420px; grid-template-rows: 1fr 1fr;">
      <div v-for="(img, i) in images.slice(1, 5)" :key="i" class="relative rounded-xl overflow-hidden" style="min-height: 0;">
        <img :src="img" alt="venue" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" />
        <div
          v-if="i === 3 && count > 5"
          class="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors"
        >
          <span class="text-white font-black text-lg">+{{ count - 5 }} Photos</span>
        </div>
      </div>
    </div>
  </div>
</template>
