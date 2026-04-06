<script setup lang="ts">
import CategoryCard from './CategoryCard.vue'

const categories = [
  {
    name: 'Turf',
    count: 12,
    gradient: 'from-green-900 via-green-700 to-green-500',
    image: 'https://picsum.photos/seed/turf-grass/500/500',
  },
  {
    name: 'Badminton',
    count: 24,
    gradient: 'from-slate-900 via-blue-900 to-blue-800',
    image: 'https://picsum.photos/seed/badminton-sport/500/500',
  },
  {
    name: 'Studio',
    count: 8,
    gradient: 'from-gray-900 via-slate-800 to-slate-700',
    image: 'https://picsum.photos/seed/yoga-studio/500/500',
  },
  {
    name: 'Futsal',
    count: 15,
    gradient: 'from-red-900 via-orange-900 to-orange-700',
    image: 'https://picsum.photos/seed/futsal-soccer/500/500',
  },
]
</script>

<template>
  <section class="max-w-6xl mx-auto px-6 py-8">
    <p class="text-orange-500 text-xs font-black uppercase tracking-widest mb-2">Categories</p>
    <h2 class="text-2xl font-black text-gray-900 uppercase mb-6">Browse by Venue Type</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <CategoryCard v-for="cat in categories" :key="cat.name" v-bind="cat" />
    </div>
  </section>
</template>
