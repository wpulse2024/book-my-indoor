<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

defineProps<{
  slug: string
  name: string
  rating: number
  reviewCount: number
  image: string
}>()

const liked = ref(true)
const router = useRouter()
</script>

<template>
  <div
    class="relative rounded-2xl overflow-hidden cursor-pointer group"
    style="height: 140px;"
    @click="router.push({ name: 'venue-detail', params: { slug } })"
  >
    <img :src="image" :alt="name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
    <!-- Dark overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

    <!-- Heart -->
    <button
      @click.stop="liked = !liked"
      class="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all"
      :class="liked ? 'bg-orange-500' : 'bg-white/80 hover:bg-white'"
    >
      <svg class="w-3.5 h-3.5" :class="liked ? 'text-white' : 'text-gray-500'" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    </button>

    <!-- Info -->
    <div class="absolute bottom-0 left-0 right-0 p-3">
      <p class="text-white font-black text-sm leading-snug">{{ name }}</p>
      <p class="text-white/70 text-xs flex items-center gap-1 mt-0.5">
        <svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        {{ rating }} ({{ reviewCount }} reviews)
      </p>
    </div>
  </div>
</template>
