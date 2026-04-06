<script setup lang="ts">
import TheNavbar from '@/components/TheNavbar.vue'
import VenueGallery from '@/components/venue-detail/VenueGallery.vue'
import BookingWidget from '@/components/venue-detail/BookingWidget.vue'
import VenueAmenities from '@/components/venue-detail/VenueAmenities.vue'
import VenueMap from '@/components/venue-detail/VenueMap.vue'
import VenueReviews from '@/components/venue-detail/VenueReviews.vue'
import AlsoBooked from '@/components/venue-detail/AlsoBooked.vue'
import VenueDetailFooter from '@/components/venue-detail/VenueDetailFooter.vue'

const venue = {
  name: 'Titan Arena Complex',
  badge: 'Most Booked',
  rating: 4.9,
  tier: 'PRO TIER VENUE',
  address: 'Downtown Sports District, Seattle',
  size: '45,000 SQ FT',
  description: 'Experience the gold standard of indoor sports. Titan Arena features Olympic-grade flooring, professional climate control, and smart-lighting technology that adapts to your game. Designed for high-performance athletes and recreational players alike, we provide the ultimate environment for competitive play and focused training.',
  images: [
    'https://picsum.photos/seed/titan-main/800/500',
    'https://picsum.photos/seed/titan-court/500/300',
    'https://picsum.photos/seed/titan-tennis/500/300',
    'https://picsum.photos/seed/titan-gym/500/300',
    'https://picsum.photos/seed/titan-locker/500/300',
  ],
  amenities: [
    { icon: '❄️', label: 'Full AC' },
    { icon: '🚿', label: 'Luxe Showers' },
    { icon: '🅿️', label: 'Valet Parking' },
    { icon: '⚡', label: 'Energy Bar' },
  ],
}
</script>

<template>
  <div class="min-h-screen bg-white font-sans">
    <TheNavbar />
    <main class="max-w-6xl mx-auto px-6 py-6">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm mb-5">
        <RouterLink to="/" class="text-gray-400 hover:text-blue-700 transition-colors font-medium">Home</RouterLink>
        <svg class="w-3.5 h-3.5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <RouterLink to="/discover" class="text-gray-400 hover:text-blue-700 transition-colors font-medium">Discover</RouterLink>
        <svg class="w-3.5 h-3.5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="text-gray-900 font-semibold truncate">{{ venue.name }}</span>
      </nav>

      <!-- Gallery -->
      <VenueGallery :images="venue.images" :badge="venue.badge" class="mb-8" />

      <!-- Two column layout -->
      <div class="flex gap-8 items-start">
        <!-- Left -->
        <div class="flex-1 min-w-0 space-y-8">
          <!-- Title block -->
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span class="bg-blue-700 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
                {{ venue.tier }}
              </span>
              <div class="flex items-center gap-1">
                <svg class="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span class="font-black text-gray-900 text-sm">{{ venue.rating }}</span>
              </div>
            </div>
            <h1 class="font-black text-gray-900 leading-tight mb-2" style="font-size: clamp(1.8rem, 3vw, 2.5rem);">
              {{ venue.name }}
            </h1>
            <div class="flex items-center gap-3 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {{ venue.address }}
              </span>
              <span class="text-gray-200">•</span>
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                </svg>
                {{ venue.size }}
              </span>
            </div>
            <p class="text-gray-500 text-sm leading-relaxed max-w-xl">{{ venue.description }}</p>
          </div>

          <VenueAmenities :amenities="venue.amenities" />
          <VenueMap :address="venue.address" />
          <VenueReviews />
        </div>

        <!-- Right: booking widget -->
        <div class="w-80 flex-shrink-0">
          <BookingWidget />
        </div>
      </div>

      <AlsoBooked />
    </main>
    <VenueDetailFooter />
  </div>
</template>
