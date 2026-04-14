<script setup lang="ts">
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import TheNavbar from '@/components/TheNavbar.vue'
import TheFooter from '@/components/TheFooter.vue'
import DiscoverFilters from '@/components/discover/DiscoverFilters.vue'
import DiscoverVenueCard from '@/components/discover/DiscoverVenueCard.vue'
import ConciergeCard from '@/components/discover/ConciergeCard.vue'
import DiscoverHeader from '@/components/discover/DiscoverHeader.vue'
import DiscoverPagination from '@/components/discover/DiscoverPagination.vue'
import http, { assetUrl } from '@/services/api'

const route = useRoute()

const PER_PAGE = 6

const q = reactive({
  sort: 'Near Me',
  page: 1,
  search: '',
  type: '',
  categoryId: '',
  date: '',
  timeFrom: '',
  timeTo: '',
  priceMax: null as number | null,
  featureIds: [] as string[],
  minRating: 0,
})

// Passed as props to DiscoverFilters so the sidebar pre-selects the right values
const initialCategoryId = ref('')
const initialDate = ref('')

function initFromQuery() {
  const rq = route.query
  q.search = typeof rq.search === 'string' ? rq.search : ''
  q.type = typeof rq.type === 'string' ? rq.type : ''
  q.date = typeof rq.date === 'string' ? rq.date : ''
  q.categoryId = typeof rq.categoryId === 'string' ? rq.categoryId : ''
  initialCategoryId.value = q.categoryId
  initialDate.value = q.date
  q.page = 1
}

watch(() => route.query, () => { initFromQuery() }, { deep: true })

const allVenues = ref<any[]>([])
const venueMinPrices = ref<Record<string, number>>({})
const loading = ref(false)
const error = ref('')

// null = no slot-based filter active; string[] = venue IDs matching date/time/price
const availableVenueIds = ref<string[] | null>(null)
const slotsLoading = ref(false)

async function fetchFilteredVenueIds() {
  const hasFilter = q.date || q.timeFrom || q.timeTo || q.priceMax !== null
  if (!hasFilter) {
    availableVenueIds.value = null
    return
  }
  slotsLoading.value = true
  try {
    const params: Record<string, any> = {}
    if (q.date) params.date = q.date
    if (q.timeFrom) params.timeFrom = q.timeFrom
    if (q.timeTo) params.timeTo = q.timeTo
    if (q.priceMax !== null) params.priceMax = q.priceMax
    const res = await http.get<string[]>('/venue-slots/public/venues', { params })
    availableVenueIds.value = Array.isArray(res.data) ? res.data : []
  } catch {
    availableVenueIds.value = null
  } finally {
    slotsLoading.value = false
  }
}

watch([() => q.date, () => q.timeFrom, () => q.timeTo, () => q.priceMax], fetchFilteredVenueIds)

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
    const [venuesRes, pricesRes] = await Promise.all([
      http.get<any[]>('/venues'),
      http.get<Record<string, number>>('/venue-slots/public/min-prices'),
    ])
    allVenues.value = venuesRes.data
    venueMinPrices.value = pricesRes.data ?? {}
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Failed to load venues.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initFromQuery()
  fetchVenues()
  requestUserLocation()
})

// Price bounds — slots are now in a separate collection; static defaults
const venueMinPrice = computed(() => 0)
const venueMaxPrice = computed(() => 5000)

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
  // When sidebar clears category, also clear type so type-pill filter doesn't persist
  if (!filters.categoryId) q.type = ''
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

  // Text search — matches venue name or area
  if (q.search) {
    const s = q.search.toLowerCase()
    list = list.filter(v =>
      (v.title ?? '').toLowerCase().includes(s) ||
      (v.location?.title ?? '').toLowerCase().includes(s)
    )
  }

  if (q.categoryId) {
    list = list.filter(v => v.categoryId?._id === q.categoryId || v.categoryId === q.categoryId)
  } else if (q.type) {
    // Sport-type pill from HeroSection (e.g. 'badminton', 'cricket_turf')
    list = list.filter(v => {
      const title = (v.categoryId?.title ?? '').toLowerCase().replace(/\s+/g, '_')
      return title === q.type
    })
  }

  // Slot-based filters (date, time, price) — resolved via API call
  if (availableVenueIds.value !== null) {
    const ids = new Set(availableVenueIds.value)
    list = list.filter(v => ids.has((v._id ?? '').toString()))
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
  const lowestPrice = venueMinPrices.value[venue._id] ?? null
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
    priceUnit: lowestPrice !== null ? 'per slot' : undefined,
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
          :initial-category-id="initialCategoryId"
          :initial-date="initialDate"
          @change="onFiltersChange"
        />

        <!-- Main content -->
        <div class="flex-1 min-w-0">
          <DiscoverHeader
            :sort="q.sort"
            @update:sort="onSortChange"
            :total="(loading || slotsLoading) ? undefined : filteredVenues.length"
          />

          <!-- Loading skeleton -->
          <div v-if="loading || slotsLoading" class="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
            <template v-if="availableVenueIds !== null && availableVenueIds.length === 0">
              No venues have available slots matching your filters. Try adjusting the date, time, or price.
            </template>
            <template v-else>
              No venues found. Try adjusting your filters.
            </template>
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
            v-if="!loading && !slotsLoading && totalPages > 1"
            v-model="q.page"
            :total-pages="totalPages"
          />
        </div>
      </div>
    </main>

    <TheFooter />
  </div>
</template>
