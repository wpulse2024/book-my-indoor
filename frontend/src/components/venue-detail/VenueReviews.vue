<script setup lang="ts">
const reviews = [
  {
    name: 'Marcus Chen',
    role: 'Professional Player',
    avatar: 'https://picsum.photos/seed/marcus/80/80',
    rating: 5,
    text: '"The flooring here is unmatched. It feels explosive yet forgiving on the joints. Highly recommend for any competitive training session."',
  },
]
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h3 class="font-black text-gray-900 text-sm uppercase tracking-widest">Athlete Reviews</h3>
      <a href="#" class="text-orange-500 hover:text-orange-600 text-sm font-bold transition-colors">
        See All 128 Reviews
      </a>
    </div>

    <div class="space-y-4">
      <div v-for="review in reviews" :key="review.name" class="border-b border-gray-100 pb-5 last:border-0">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <img :src="review.avatar" :alt="review.name" class="w-10 h-10 rounded-full object-cover" />
            <div>
              <p class="font-black text-gray-900 text-sm">{{ review.name }}</p>
              <p class="text-gray-400 text-xs uppercase tracking-wide font-semibold">{{ review.role }}</p>
            </div>
          </div>
          <div class="flex gap-0.5">
            <svg v-for="i in 5" :key="i" class="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed italic">{{ review.text }}</p>
      </div>
    </div>
  </div>
</template>
