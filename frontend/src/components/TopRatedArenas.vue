<script setup lang="ts">
import VenueCard from './VenueCard.vue'

const venues = [
  {
    slug: 'victory-multi-sport-complex',
    name: 'Victory Multi-Sport Complex',
    location: 'Banani, Dhaka',
    rating: 4.9,
    priceFrom: '৳1,200',
    tags: ['Badminton', 'Basketball'],
    gradient: 'from-slate-800 via-blue-900 to-slate-700',
    image: 'https://picsum.photos/seed/victory-arena/600/400',
  },
  {
    slug: 'elite-indoor-turf-grounds',
    name: 'Elite Indoor Turf Grounds',
    location: 'Uttara, Dhaka',
    rating: 4.7,
    priceFrom: '৳800',
    tags: ['Futsal', 'Cricket'],
    gradient: 'from-green-900 via-green-700 to-emerald-600',
    image: 'https://picsum.photos/seed/elite-turf/600/400',
  },
  {
    slug: 'the-zen-wellness-studio',
    name: 'The Zen Wellness Studio',
    location: 'Dhanmondi, Dhaka',
    rating: 4.8,
    priceFrom: '৳1,500',
    tags: ['Yoga', 'Dance'],
    gradient: 'from-amber-900 via-yellow-800 to-amber-700',
    image: 'https://picsum.photos/seed/zen-studio/600/400',
  },
]
</script>

<template>
  <section class="max-w-6xl mx-auto px-6 py-8">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-black text-gray-900 uppercase">Top Rated Arenas</h2>
      <RouterLink to="/discover" class="text-blue-700 text-sm font-bold flex items-center gap-1 hover:underline">
        View all
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </RouterLink>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <VenueCard v-for="venue in venues" :key="venue.name" v-bind="venue" />
    </div>
  </section>
</template>
