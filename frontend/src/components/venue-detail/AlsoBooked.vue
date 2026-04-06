<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const venues = [
  {
    slug: 'the-sky-court',
    name: 'The Sky Court',
    type: 'Rooftop',
    distance: '2.4',
    badge: 'ELITE',
    badgeColor: 'bg-blue-700',
    image: 'https://picsum.photos/seed/sky-court/400/250',
  },
  {
    slug: 'nexus-multi-sport',
    name: 'Nexus Multi-Sport',
    type: 'Indoor',
    distance: '3.1',
    badge: 'TEAM CHOICE',
    badgeColor: 'bg-green-500',
    image: 'https://picsum.photos/seed/nexus-sport/400/250',
  },
  {
    slug: 'goal-point-arena',
    name: 'Goal Point Arena',
    type: 'Futsal',
    distance: '1.8',
    badge: null,
    badgeColor: '',
    image: 'https://picsum.photos/seed/goal-arena/400/250',
  },
]
</script>

<template>
  <section class="mt-12">
    <h2 class="font-black text-blue-700 italic text-2xl mb-6">Athletes Also Booked</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <div
        v-for="venue in venues"
        :key="venue.name"
        class="cursor-pointer group"
        @click="router.push({ name: 'venue-detail', params: { slug: venue.slug } })"
      >
        <div class="relative rounded-2xl overflow-hidden mb-3" style="height: 160px;">
          <img
            :src="venue.image"
            :alt="venue.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
          />
          <span
            v-if="venue.badge"
            :class="['absolute top-3 left-3 text-white text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wide', venue.badgeColor]"
          >
            {{ venue.badge }}
          </span>
        </div>
        <h3 class="font-black text-gray-900 text-sm mb-0.5">{{ venue.name }}</h3>
        <p class="text-gray-400 text-xs font-semibold uppercase tracking-wide">
          {{ venue.type }} &bull; {{ venue.distance }} Miles Away
        </p>
      </div>
    </div>
  </section>
</template>
