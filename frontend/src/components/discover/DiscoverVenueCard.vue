<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  slug: string
  name: string
  location: string
  distance: string
  price: number
  priceUnit?: string
  rating: number
  reviewCount: number
  availability: 'available' | 'next' | null
  availableAt?: string
  amenities: { icon: string; label: string }[]
  gradient: string
  image?: string
  dots?: number
}>()

const liked = ref(false)
const router = useRouter()

function goToDetail() {
  router.push({ name: 'venue-detail', params: { slug: props.slug } })
}
</script>

<template>
  <div class="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 group cursor-pointer" @click="goToDetail">
    <!-- Image -->
    <div class="relative overflow-hidden" style="height: 220px;">
      <img
        v-if="image"
        :src="image"
        :alt="name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div v-else :class="['w-full h-full bg-gradient-to-br group-hover:scale-105 transition-transform duration-500', gradient]"></div>

      <!-- Availability badge -->
      <div
        v-if="availability === 'available'"
        class="absolute top-3 left-3 flex items-center gap-1.5 bg-green-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
        Available Now
      </div>
      <div
        v-else-if="availability === 'next'"
        class="absolute top-3 left-3 flex items-center gap-1.5 bg-gray-800/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
        Next Available: {{ availableAt }}
      </div>

      <!-- Wishlist button -->
      <button
        @click="liked = !liked"
        class="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow transition-all"
        :class="liked ? 'bg-orange-500' : 'bg-white hover:bg-gray-50'"
      >
        <svg class="w-4 h-4" :class="liked ? 'text-white' : 'text-gray-400'" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>

      <!-- Rating badge -->
      <div class="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
        <svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        {{ rating }} ({{ reviewCount }} reviews)
      </div>

      <!-- Image dots -->
      <div v-if="dots && dots > 1" class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
        <span v-for="i in dots" :key="i" :class="['w-1.5 h-1.5 rounded-full', i === 1 ? 'bg-white' : 'bg-white/40']"></span>
      </div>
    </div>

    <!-- Info -->
    <div class="p-5">
      <div class="flex items-start justify-between gap-3 mb-1.5">
        <h3 class="font-black text-gray-900 text-base leading-snug">{{ name }}</h3>
        <div class="text-right flex-shrink-0">
          <span class="text-blue-700 font-black text-xl">${{ price }}</span>
          <p class="text-gray-400 text-xs">{{ priceUnit ?? 'per hour' }}</p>
        </div>
      </div>

      <p class="text-gray-400 text-sm flex items-center gap-1 mb-4">
        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {{ location }}<template v-if="distance"> &bull; {{ distance }} away</template>
      </p>

      <!-- Amenities -->
      <div class="flex items-center gap-4 mb-5">
        <div v-for="amenity in amenities" :key="amenity.label" class="flex flex-col items-center gap-1">
          <span class="text-gray-400 text-lg">{{ amenity.icon }}</span>
          <span class="text-gray-400 text-xs font-semibold uppercase tracking-wide">{{ amenity.label }}</span>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex items-center gap-3" @click.stop>
        <button
          @click="goToDetail"
          class="flex-1 border border-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl hover:border-blue-300 hover:text-blue-700 transition-colors"
        >
          Details
        </button>
        <button
          @click="goToDetail"
          class="flex-2 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm py-2.5 px-6 rounded-xl transition-colors uppercase tracking-wide"
        >
          Book Slot
        </button>
      </div>
    </div>
  </div>
</template>
