<script setup lang="ts">
defineProps<{
  name: string
  count?: number
  gradient: string
  image?: string
}>()
</script>

<template>
  <div class="relative rounded-xl overflow-hidden cursor-pointer group" style="aspect-ratio: 1;">
    <!-- Background image or gradient -->
    <div v-if="image" class="absolute inset-0">
      <img :src="image" :alt="name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
    </div>
    <div v-else :class="['absolute inset-0 bg-gradient-to-br group-hover:scale-110 transition-transform duration-500', gradient]"></div>

    <!-- Dark overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover:from-black/70 transition-colors"></div>

    <!-- Text -->
    <div class="absolute bottom-0 left-0 right-0 p-4">
      <p class="text-white font-black text-base uppercase tracking-wider leading-none mb-1">{{ name }}</p>
      <p v-if="count != null" class="text-orange-400 text-xs font-bold uppercase tracking-widest">{{ count }} Venues</p>
    </div>
  </div>
</template>
