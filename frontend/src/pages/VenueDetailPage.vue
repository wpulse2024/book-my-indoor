<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TheNavbar from '@/components/TheNavbar.vue'
import VenueGallery from '@/components/venue-detail/VenueGallery.vue'
import BookingWidget from '@/components/venue-detail/BookingWidget.vue'
import VenueAmenities from '@/components/venue-detail/VenueAmenities.vue'
import VenueMap from '@/components/venue-detail/VenueMap.vue'
import VenueReviews from '@/components/venue-detail/VenueReviews.vue'
import AlsoBooked from '@/components/venue-detail/AlsoBooked.vue'
import VenueDetailFooter from '@/components/venue-detail/VenueDetailFooter.vue'
import http, { assetUrl } from '@/services/api'

const route = useRoute()
const venueId = route.params.slug as string

const venue = ref<any>(null)
const loading = ref(false)
const error = ref('')

async function fetchVenue() {
  loading.value = true
  error.value = ''
  try {
    const res = await http.get<any>(`/venues/${venueId}`)
    venue.value = res.data
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Failed to load venue.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchVenue)

const galleryImages = computed(() => {
  if (!venue.value?.images?.length) return ['https://picsum.photos/seed/venue-default/800/500']
  return venue.value.images.map((img: string) => assetUrl(img))
})

const amenities = computed(() =>
  (venue.value?.features ?? []).map((f: any) => ({
    icon: f.icon ?? '✓',
    label: f.name ?? '',
  }))
)

const lowestPrice = computed(() => {
  const slots = venue.value?.slots ?? []
  if (!slots.length) return 0
  return Math.min(...slots.map((s: any) => Number(s.price) || 0))
})

const categoryLabel = computed(() => {
  const cat = venue.value?.categoryId
  if (!cat) return ''
  return typeof cat === 'object' ? (cat.title ?? cat.name ?? '') : ''
})
</script>

<template>
  <div class="min-h-screen bg-white font-sans">
    <TheNavbar />

    <!-- Loading skeleton -->
    <main v-if="loading" class="max-w-6xl mx-auto px-6 py-6">
      <div class="animate-pulse space-y-6">
        <div class="h-4 bg-gray-200 rounded w-64"></div>
        <div class="rounded-xl bg-gray-200" style="height: 400px;"></div>
        <div class="flex gap-8 mt-6">
          <div class="flex-1 space-y-4">
            <div class="h-8 bg-gray-200 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            <div class="h-24 bg-gray-200 rounded"></div>
          </div>
          <div class="w-80 bg-gray-200 rounded-2xl flex-shrink-0" style="height: 480px;"></div>
        </div>
      </div>
    </main>

    <!-- Error state -->
    <main v-else-if="error" class="max-w-6xl mx-auto px-6 py-20 text-center">
      <p class="text-red-500 text-sm font-medium">{{ error }}</p>
      <RouterLink to="/discover" class="mt-4 inline-block text-blue-700 text-sm font-semibold hover:underline">
        ← Back to Discover
      </RouterLink>
    </main>

    <!-- Venue content -->
    <main v-else-if="venue" class="max-w-6xl mx-auto px-6 py-6">
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
        <span class="text-gray-900 font-semibold truncate">{{ venue.title }}</span>
      </nav>

      <!-- Gallery -->
      <VenueGallery :images="galleryImages" class="mb-8" />

      <!-- Two column layout -->
      <div class="flex gap-8 items-start">
        <!-- Left -->
        <div class="flex-1 min-w-0 space-y-8">
          <!-- Title block -->
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span v-if="categoryLabel" class="bg-blue-700 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
                {{ categoryLabel }}
              </span>
              <div v-if="venue.rating" class="flex items-center gap-1">
                <svg class="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span class="font-black text-gray-900 text-sm">{{ Number(venue.rating).toFixed(1) }}</span>
              </div>
            </div>

            <h1 class="font-black text-gray-900 leading-tight mb-2" style="font-size: clamp(1.8rem, 3vw, 2.5rem);">
              {{ venue.title }}
            </h1>

            <div class="flex flex-wrap items-center gap-3 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <span v-if="venue.location?.title" class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {{ venue.location.title }}
              </span>
              <span v-if="venue.slots?.length" class="text-gray-200">•</span>
              <span v-if="venue.slots?.length" class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ venue.slots.length }} Time Slots
              </span>
            </div>

            <p v-if="venue.description" class="text-gray-500 text-sm leading-relaxed max-w-xl">
              {{ venue.description }}
            </p>
          </div>

          <VenueAmenities v-if="amenities.length" :amenities="amenities" />
          <VenueMap
            v-if="venue.location?.lat && venue.location?.long"
            :lat="venue.location.lat"
            :lng="venue.location.long"
            :address="venue.location.title"
          />
          <VenueReviews :venue-id="venue._id" />
        </div>

        <!-- Right: booking widget -->
        <div class="w-80 flex-shrink-0">
          <BookingWidget :venue="venue" :lowest-price="lowestPrice" />
        </div>
      </div>

      <AlsoBooked />
    </main>

    <VenueDetailFooter />
  </div>
</template>
