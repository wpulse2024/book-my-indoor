<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{
  slug: string
  name: string
  location: string
  rating: number
  priceFrom: string
  tags: string[]
  gradient: string
  image?: string
}>()

const router = useRouter()
function goToDetail() {
  router.push({ name: 'venue-detail', params: { slug: props.slug } })
}
</script>

<template>
  <div @click="goToDetail" class="bg-white rounded-xl overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300">
    <!-- Image -->
    <div class="relative overflow-hidden" style="height: 180px;">
      <img v-if="image" :src="image" :alt="name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      <div v-else :class="['w-full h-full bg-gradient-to-br group-hover:scale-110 transition-transform duration-500', gradient]"></div>

      <!-- Price badge -->
      <span class="absolute top-3 right-3 bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
        From {{ priceFrom }}/hr
      </span>

      <!-- Rating badge -->
      <span class="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
        <svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        {{ rating }}
      </span>
    </div>

    <!-- Info -->
    <div class="p-4">
      <h3 class="font-black text-gray-900 text-sm mb-1 leading-snug">{{ name }}</h3>
      <p class="text-gray-400 text-xs flex items-center gap-1 mb-3">
        <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {{ location }}
      </p>
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="tag in tags"
          :key="tag"
          class="text-xs font-black text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full uppercase tracking-wide"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>
