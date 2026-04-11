<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import TheNavbar from '@/components/TheNavbar.vue'
import TheFooter from '@/components/TheFooter.vue'
import DiscoverFilters from '@/components/discover/DiscoverFilters.vue'
import DiscoverVenueCard from '@/components/discover/DiscoverVenueCard.vue'
import ConciergeCard from '@/components/discover/ConciergeCard.vue'
import DiscoverHeader from '@/components/discover/DiscoverHeader.vue'
import DiscoverPagination from '@/components/discover/DiscoverPagination.vue'
import http, { assetUrl } from '@/services/api'

const PER_PAGE = 6

const q = reactive({
  sort: 'Near Me',
  page: 1,
  categoryId: '',
  date: '',
  timeFrom: '',
  timeTo: '',
  priceMax: null as number | null,
  featureIds: [] as string[],
  minRating: 0,
})

const allVenues = ref<any[]>([])
const loading = ref(false)
const error = ref('')

// ─── Geolocation ──────────────────────────────────────────────────────────────
const userLocation = ref<{ lat: number; lng: number } | null>(null)

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function requestUserLocation() {
  if (!navigator.geolocation) return
  navigator.geolocation.getCurrentPosition(
    (pos) => { userLocation.value = { lat: pos.coords.latitude, lng: pos.coords.longitude } },
    () => { /* silently ignore denial */ },
    { timeout: 8000 },
  )
}

async function fetchVenues() {
  loading.value = true
  error.value = ''
  try {
    const res = await http.get<any[]>('/venues')
    allVenues.value = res.data
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Failed to load venues.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchVenues()
  requestUserLocation()
})

// ─── Price bounds derived from actual venue data ───────────────────────────────
const venueMinPrice = computed(() => {
  const prices = allVenues.value.flatMap(v => (v.slots ?? []).map((s: any) => s.price)).filter(Boolean)
  return prices.length ? Math.min(...prices) : 0
})

const venueMaxPrice = computed(() => {
  const prices = allVenues.value.flatMap(v => (v.slots ?? []).map((s: any) => s.price)).filter(Boolean)
  return prices.length ? Math.max(...prices) : 1000
})

function onSortChange(newSort: string) {
  q.sort = newSort
  q.page = 1
}

function onFiltersChange(filters: {
  categoryId: string
  date: string
  timeFrom: string
  timeTo: string
  priceMax: number | null
  featureIds: string[]
  minRating: number
}) {
  q.categoryId = filters.categoryId
  q.date = filters.date
  q.timeFrom = filters.timeFrom
  q.timeTo = filters.timeTo
  q.priceMax = filters.priceMax
  q.featureIds = filters.featureIds
  q.minRating = filters.minRating
  q.page = 1
}

// ─── Client-side filter → sort → paginate ─────────────────────────────────────

const filteredVenues = computed(() => {
  let list = [...allVenues.value]

  if (q.categoryId) {
    list = list.filter(v => v.categoryId?._id === q.categoryId || v.categoryId === q.categoryId)
  }

  if (q.priceMax != null) {
    list = list.filter(v => {
      const min = v.slots?.length ? Math.min(...v.slots.map((s: any) => s.price)) : 0
      return min <= q.priceMax!
    })
  }

  if (q.timeFrom && q.timeTo) {
    list = list.filter(v => {
      if (!v.slots?.length) return false
      return v.slots.some((s: any) => {
        const start: string = s.start_time ?? s.startTime ?? s.time ?? ''
        return start >= q.timeFrom && start < q.timeTo
      })
    })
  }

  if (q.featureIds.length) {
    list = list.filter(v => {
      const vFeatureIds: string[] = (v.features ?? []).map((f: any) => f._id ?? f.id ?? '')
      return q.featureIds.every(id => vFeatureIds.includes(id))
    })
  }

  if (q.minRating > 0) {
    list = list.filter(v => (v.rating ?? 0) >= q.minRating)
  }

  if (q.sort === 'Near Me' && userLocation.value) {
    const { lat, lng } = userLocation.value
    list.sort((a, b) => {
      const da = haversineKm(lat, lng, a.location?.lat ?? 0, a.location?.long ?? 0)
      const db = haversineKm(lat, lng, b.location?.lat ?? 0, b.location?.long ?? 0)
      return da - db
    })
  } else if (q.sort === 'Price Low to High') {
    list.sort((a, b) => {
      const pa = a.slots?.length ? Math.min(...a.slots.map((s: any) => s.price)) : 0
      const pb = b.slots?.length ? Math.min(...b.slots.map((s: any) => s.price)) : 0
      return pa - pb
    })
  } else if (q.sort === 'Top Rated') {
    list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
  }

  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredVenues.value.length / PER_PAGE)))

const pagedVenues = computed(() => {
  const start = (q.page - 1) * PER_PAGE
  return filteredVenues.value.slice(start, start + PER_PAGE)
})

// ─── Venue → card prop mapping ────────────────────────────────────────────────

const typeGradients: Record<string, string> = {
  basketball: 'from-orange-900 via-orange-800 to-red-900',
  badminton: 'from-green-900 via-emerald-800 to-teal-900',
  futsal: 'from-blue-900 via-blue-800 to-indigo-900',
  tennis: 'from-yellow-900 via-amber-800 to-orange-900',
  cricket: 'from-green-900 via-green-800 to-lime-900',
  cricket_turf: 'from-green-900 via-green-800 to-lime-900',
  swimming: 'from-cyan-900 via-blue-800 to-blue-900',
  gym: 'from-gray-900 via-gray-800 to-gray-700',
  yoga: 'from-purple-900 via-pink-800 to-rose-900',
  yoga_studio: 'from-purple-900 via-pink-800 to-rose-900',
  other: 'from-slate-900 via-slate-800 to-slate-700',
}

function toCardProps(venue: any) {
  const lowestPrice = venue.slots?.length
    ? Math.min(...venue.slots.map((s: any) => s.price))
    : 0
  const catKey = (venue.categoryId?.title ?? '').toLowerCase().replace(/\s+/g, '_')

  const distanceStr = (() => {
    if (!userLocation.value || !venue.location?.lat) return ''
    const km = haversineKm(userLocation.value.lat, userLocation.value.lng, venue.location.lat, venue.location.long)
    return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
  })()

  return {
    slug: venue._id,
    name: venue.title,
    location: venue.location?.title ?? '',
    distance: distanceStr,
    price: lowestPrice,
    priceUnit: 'per slot',
    rating: venue.rating ?? 0,
    reviewCount: 0,
    availability: null as null,
    amenities: (venue.features ?? []).slice(0, 4).map((f: any) => ({
      icon: f.icon ?? '✓',
      label: f.name ?? '',
    })),
    gradient: typeGradients[catKey] ?? typeGradients.other,
    image: venue.images?.[0] ? assetUrl(venue.images[0]) : undefined,
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <TheNavbar />

    <main class="max-w-6xl mx-auto px-6 py-8">
      <div class="flex gap-8">
        <!-- Sidebar filters -->
        <DiscoverFilters
          :price-floor="venueMinPrice"
          :price-ceiling="venueMaxPrice"
          @change="onFiltersChange"
        />

        <!-- Main content -->
        <div class="flex-1 min-w-0">
          <DiscoverHeader
            :sort="q.sort"
            @update:sort="onSortChange"
            :total="loading ? undefined : filteredVenues.length"
          />

          <!-- Loading skeleton -->
          <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div v-for="i in 4" :key="i" class="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
              <div class="bg-gray-200" style="height: 220px;"></div>
              <div class="p-5 space-y-3">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                <div class="h-8 bg-gray-200 rounded mt-4"></div>
              </div>
            </div>
          </div>

          <!-- Error state -->
          <div v-else-if="error" class="text-center py-16 text-red-500 text-sm">{{ error }}</div>

          <!-- Empty state -->
          <div v-else-if="!pagedVenues.length" class="text-center py-16 text-gray-400 text-sm">
            No venues found. Try adjusting your filters.
          </div>

          <!-- Results grid -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <DiscoverVenueCard
              v-for="venue in pagedVenues"
              :key="venue._id"
              v-bind="toCardProps(venue)"
            />
            <ConciergeCard />
          </div>

          <!-- Pagination -->
          <DiscoverPagination
            v-if="!loading && totalPages > 1"
            v-model="q.page"
            :total-pages="totalPages"
          />
        </div>
      </div>
    </main>

    <TheFooter />
  </div>
</template>
