<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import http, { assetUrl } from '@/services/api'

// ── Raw shape returned by the NestJS backend ────────────────────────────────
interface RawVenue {
  _id: string
  title: string
  description?: string
  location?: { title?: string; lat?: number; long?: number }
  rating?: number
  images?: string[]
  slots?: Array<{ startTime?: string; endTime?: string; price?: number }>
  categoryId?: { _id: string; title: string; image?: string } | null
  features?: Array<{ _id: string; name: string; icon?: string }>
  organizationId?: string
  createdAt?: string
}

// ── Mapped shape used by the template ──────────────────────────────────────
interface CardVenue {
  id: string
  title: string
  location: string
  rating: number
  lowestPrice: number | null
  coverImage: string | null
  tags: string[]
}

const router = useRouter()
const cards = ref<CardVenue[]>([])
const loading = ref(true)
const isTopRated = ref(false)

const sectionTitle   = computed(() => isTopRated.value ? 'Top Rated Arenas' : 'Latest Venues')
const sectionEyebrow = computed(() => isTopRated.value ? 'Community Favorites' : 'New Additions')
const sectionSub     = computed(() =>
  isTopRated.value
    ? 'Highest-rated venues chosen by our community'
    : 'Recently added venues — be the first to book'
)

const gradients = [
  'from-slate-800 via-blue-900 to-slate-700',
  'from-green-900 via-green-700 to-emerald-600',
  'from-amber-900 via-yellow-800 to-amber-700',
  'from-red-900 via-rose-800 to-red-700',
  'from-purple-900 via-violet-800 to-purple-700',
  'from-gray-900 via-slate-700 to-gray-600',
]

function mapToCard(v: RawVenue): CardVenue {
  const prices = (v.slots ?? []).map(s => s.price ?? 0).filter(p => p > 0)
  const tags = v.features?.length
    ? v.features.map(f => f.name).slice(0, 3)
    : [v.categoryId?.title ?? 'Indoor']

  return {
    id: v._id,
    title: v.title,
    location: v.location?.title ?? '',
    rating: v.rating ?? 0,
    lowestPrice: prices.length ? Math.min(...prices) : null,
    coverImage: (v.images ?? [])[0] ?? null,
    tags,
  }
}

function formatPrice(c: CardVenue): string {
  return c.lowestPrice ? `৳${c.lowestPrice.toLocaleString()}` : 'N/A'
}

function goToVenue(id: string) {
  router.push({ name: 'venue-detail', params: { slug: id } })
}

onMounted(async () => {
  try {
    const res = await http.get<RawVenue[]>('/venues')
    const raw: RawVenue[] = Array.isArray(res.data) ? res.data : []

    // Use top-rated if at least 2 venues have a real rating
    const rated = raw.filter(v => (v.rating ?? 0) > 0)
    if (rated.length >= 2) {
      cards.value = [...rated]
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, 6)
        .map(mapToCard)
      isTopRated.value = true
    } else {
      // Latest-first fallback (sort by createdAt desc)
      cards.value = [...raw]
        .sort((a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        )
        .slice(0, 6)
        .map(mapToCard)
      isTopRated.value = false
    }
  } catch {
    // silently fail — section won't render
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">

    <!-- Section header -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <p class="text-orange-500 text-xs font-black uppercase tracking-widest mb-2">
          {{ sectionEyebrow }}
        </p>
        <h2 class="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">
          {{ sectionTitle }}
        </h2>
        <p class="text-gray-400 text-sm mt-1.5">{{ sectionSub }}</p>
      </div>
      <RouterLink
        to="/discover"
        class="flex-shrink-0 inline-flex items-center gap-1.5 text-blue-700 text-sm font-bold hover:text-blue-800 transition-colors group"
      >
        View all venues
        <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </RouterLink>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="i in 6" :key="i" class="bg-gray-100 rounded-xl animate-pulse" style="height: 280px;" />
    </div>

    <!-- Empty state -->
    <div v-else-if="cards.length === 0" class="text-center py-16">
      <p class="text-5xl mb-4">🏟️</p>
      <p class="text-gray-400 text-sm font-medium">No venues available yet.</p>
      <RouterLink to="/discover" class="mt-4 inline-block text-blue-700 text-sm font-bold hover:underline">
        Explore all venues
      </RouterLink>
    </div>

    <!-- Venue grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="(card, i) in cards"
        :key="card.id"
        @click="goToVenue(card.id)"
        class="bg-white rounded-xl overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300"
      >
        <!-- Image / gradient -->
        <div class="relative overflow-hidden" style="height: 190px;">
          <img
            v-if="card.coverImage"
            :src="assetUrl(card.coverImage)"
            :alt="card.title"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div
            v-else
            :class="['w-full h-full bg-gradient-to-br group-hover:scale-110 transition-transform duration-500', gradients[i % gradients.length]]"
          ></div>

          <!-- Price badge -->
          <span class="absolute top-3 right-3 bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
            From {{ formatPrice(card) }}/hr
          </span>

          <!-- Rating badge -->
          <span
            v-if="card.rating > 0"
            class="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
          >
            <svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {{ card.rating.toFixed(1) }}
          </span>
        </div>

        <!-- Info -->
        <div class="p-4">
          <h3 class="font-black text-gray-900 text-sm mb-1 leading-snug">{{ card.title }}</h3>
          <p v-if="card.location" class="text-gray-400 text-xs flex items-center gap-1 mb-3">
            <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ card.location }}
          </p>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="tag in card.tags"
              :key="tag"
              class="text-xs font-black text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full uppercase tracking-wide"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>
