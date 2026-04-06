<script setup lang="ts">
import { ref } from 'vue'
import TheNavbar from '@/components/TheNavbar.vue'
import TheFooter from '@/components/TheFooter.vue'
import DiscoverFilters from '@/components/discover/DiscoverFilters.vue'
import DiscoverVenueCard from '@/components/discover/DiscoverVenueCard.vue'
import ConciergeCard from '@/components/discover/ConciergeCard.vue'
import DiscoverHeader from '@/components/discover/DiscoverHeader.vue'
import DiscoverPagination from '@/components/discover/DiscoverPagination.vue'

const sort = ref('Near Me')

const venues = [
  {
    name: 'The Kinetic Arena',
    location: 'Brooklyn, NY',
    distance: '1.2',
    price: 85,
    rating: 4.9,
    reviewCount: 128,
    availability: 'available' as const,
    amenities: [
      { icon: '❄️', label: 'A/C' },
      { icon: '👕', label: 'Changing' },
      { icon: '🅿️', label: 'Parking' },
      { icon: '📶', label: 'Free Wifi' },
    ],
    gradient: 'from-yellow-900 via-amber-800 to-orange-900',
    image: 'https://picsum.photos/seed/kinetic-arena/600/400',
    dots: 3,
  },
  {
    name: 'The Shuttle Hub',
    location: 'Manhattan, NY',
    distance: '3.5',
    price: 45,
    rating: 4.7,
    reviewCount: 84,
    availability: 'next' as const,
    availableAt: '4 PM',
    amenities: [
      { icon: '🚿', label: 'Showers' },
      { icon: '☕', label: 'Cafe' },
      { icon: '⚡', label: 'EV Charge' },
    ],
    gradient: 'from-slate-900 via-blue-900 to-slate-800',
    image: 'https://picsum.photos/seed/shuttle-hub/600/400',
  },
  {
    name: 'Prime Tennis Club',
    location: 'Queens, NY',
    distance: '5.8',
    price: 120,
    rating: 5.0,
    reviewCount: 42,
    availability: 'available' as const,
    amenities: [
      { icon: '❄️', label: 'A/C' },
      { icon: '🛋️', label: 'Lounge' },
      { icon: '👟', label: 'Gear Rent' },
    ],
    gradient: 'from-gray-900 via-gray-800 to-gray-700',
    image: 'https://picsum.photos/seed/prime-tennis/600/400',
  },
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <TheNavbar />

    <main class="max-w-6xl mx-auto px-6 py-8">
      <div class="flex gap-8">
        <!-- Sidebar -->
        <DiscoverFilters />

        <!-- Main content -->
        <div class="flex-1 min-w-0">
          <DiscoverHeader v-model:sort="sort" />

          <!-- Grid: 2 cols, with concierge card in 4th slot -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <DiscoverVenueCard
              v-for="(venue, i) in venues"
              :key="venue.name"
              v-bind="venue"
            />

            <!-- 4th slot: Can't Find a Court -->
            <ConciergeCard />
          </div>

          <DiscoverPagination />
        </div>
      </div>
    </main>

    <TheFooter />
  </div>
</template>
