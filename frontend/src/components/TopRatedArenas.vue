<script setup lang="ts">
import { ref, onMounted } from 'vue'
import VenueCard from './VenueCard.vue'
import { venueApi, assetUrl } from '@/services/api'
import type { Venue } from '@/types'

const venues = ref<Venue[]>([])
const loading = ref(true)

const gradients = [
  'from-slate-800 via-blue-900 to-slate-700',
  'from-green-900 via-green-700 to-emerald-600',
  'from-amber-900 via-yellow-800 to-amber-700',
  'from-red-900 via-rose-800 to-red-700',
  'from-purple-900 via-violet-800 to-purple-700',
  'from-gray-900 via-slate-700 to-gray-600',
]

const typeLabel: Record<string, string> = {
  cricket_turf: 'Cricket',
  badminton: 'Badminton',
  futsal: 'Futsal',
  basketball: 'Basketball',
  tennis: 'Tennis',
  swimming: 'Swimming',
  gym: 'Gym',
  yoga_studio: 'Yoga',
  other: 'Indoor',
}

function venueLocation(v: Venue): string {
  return [v.area, v.city].filter(Boolean).join(', ') || v.address
}

function venueTags(v: Venue): string[] {
  if (v.amenities?.length) return v.amenities.slice(0, 3)
  return [typeLabel[v.type] ?? v.type]
}

function formatPrice(v: Venue): string {
  if (v.lowestPrice) return `৳${v.lowestPrice.toLocaleString()}`
  return 'N/A'
}

onMounted(async () => {
  try {
    const res = await venueApi.list({ perPage: 9 })
    const items: Venue[] = res.data?.data?.items ?? []
    venues.value = [...items]
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 3)
  } catch {
    // silently fail
  } finally {
    loading.value = false
  }
})
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

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div
        v-for="i in 3"
        :key="i"
        class="bg-gray-100 rounded-xl animate-pulse"
        style="height: 280px;"
      />
    </div>

    <!-- Empty state -->
    <p v-else-if="venues.length === 0" class="text-center text-gray-400 py-12 text-sm">
      No venues available yet.
    </p>

    <!-- Venue grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <VenueCard
        v-for="(venue, i) in venues"
        :key="venue.id"
        :slug="venue.slug"
        :name="venue.name"
        :location="venueLocation(venue)"
        :rating="venue.rating ?? 0"
        :price-from="formatPrice(venue)"
        :tags="venueTags(venue)"
        :gradient="gradients[i % gradients.length]"
        :image="venue.coverImage ? assetUrl(venue.coverImage) : undefined"
      />
    </div>
  </section>
</template>
