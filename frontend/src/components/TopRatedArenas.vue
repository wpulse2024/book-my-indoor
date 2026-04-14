<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import http, { assetUrl } from '@/services/api'
import { useWishlistStore } from '@/stores/wishlist.store'

// ── Raw shape returned by the backend ──────────────────────────────────────
interface RawVenue {
  _id: string
  title: string
  description?: string
  location?: { title?: string; lat?: number; long?: number }
  rating?: number
  reviewCount?: number
  images?: string[]
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
  reviewCount: number
  lowestPrice: number | null
  coverImage: string | null
  sportBadge: string
}

const router         = useRouter()
const wishlistStore  = useWishlistStore()
const cards          = ref<CardVenue[]>([])
const loading        = ref(true)

const gradients = [
  'from-slate-800 via-blue-900 to-slate-700',
  'from-green-900 via-green-700 to-emerald-600',
  'from-amber-900 via-yellow-800 to-amber-700',
  'from-red-900 via-rose-800 to-red-700',
]

function mapToCard(v: RawVenue): CardVenue {
  return {
    id: v._id,
    title: v.title,
    location: v.location?.title ?? '',
    rating: v.rating ?? 0,
    reviewCount: v.reviewCount ?? 0,
    lowestPrice: null,          // prices live in a separate collection
    coverImage: (v.images ?? [])[0] ?? null,
    sportBadge: v.categoryId?.title ?? (v.features?.[0]?.name ?? 'Indoor'),
  }
}

function formatPrice(c: CardVenue): string {
  return c.lowestPrice ? `৳${c.lowestPrice.toLocaleString()}` : '—'
}

function goToVenue(id: string) {
  router.push({ name: 'venue-detail', params: { slug: id } })
}

onMounted(async () => {
  try {
    const res = await http.get<RawVenue[]>('/venues')
    const raw: RawVenue[] = Array.isArray(res.data) ? res.data : []

    const rated = raw.filter(v => (v.rating ?? 0) > 0)
    if (rated.length >= 2) {
      cards.value = [...rated]
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, 4)
        .map(mapToCard)
    } else {
      cards.value = [...raw]
        .sort((a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        )
        .slice(0, 4)
        .map(mapToCard)
    }
  } catch {
    // silently fail
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="bg-white py-12 md:py-16">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">

      <!-- Section header -->
      <div class="flex items-end justify-between mb-8">
        <div>
          <h2 class="text-2xl md:text-3xl font-black text-gray-900">Top Rated Arenas</h2>
          <p class="text-gray-400 text-sm mt-1">Most popular venues in your area</p>
        </div>
        <RouterLink
          to="/discover"
          class="flex-shrink-0 inline-flex items-center gap-1 text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors group"
        >
          View All
          <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </RouterLink>
      </div>

      <!-- Loading skeleton — 4 columns -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div v-for="i in 4" :key="i" class="bg-gray-100 rounded-2xl animate-pulse" style="height: 300px;" />
      </div>

      <!-- Empty state -->
      <div v-else-if="cards.length === 0" class="text-center py-16">
        <p class="text-5xl mb-4">🏟️</p>
        <p class="text-gray-400 text-sm font-medium">No venues available yet.</p>
        <RouterLink to="/discover" class="mt-4 inline-block text-blue-600 text-sm font-bold hover:underline">
          Explore all venues
        </RouterLink>
      </div>

      <!-- Venue grid — 4 columns -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          v-for="(card, i) in cards"
          :key="card.id"
          class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col"
          @click="goToVenue(card.id)"
        >
          <!-- ── Image area ─────────────────────────────────────────────── -->
          <div class="relative overflow-hidden" style="height: 180px; flex-shrink: 0;">
            <!-- Cover photo or gradient fallback -->
            <img
              v-if="card.coverImage"
              :src="assetUrl(card.coverImage)"
              :alt="card.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div
              v-else
              :class="['w-full h-full bg-gradient-to-br group-hover:scale-105 transition-transform duration-500', gradients[i % gradients.length]]"
            ></div>

            <!-- Sport badge — top left -->
            <span class="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow">
              {{ card.sportBadge }}
            </span>

            <!-- Heart / wishlist — top right -->
            <button
              class="absolute top-3 right-3 w-7 h-7 backdrop-blur-sm rounded-full flex items-center justify-center shadow transition-all"
              :class="wishlistStore.isWishlisted(card.id) ? 'bg-orange-500' : 'bg-white/90 hover:bg-white'"
              @click.stop="wishlistStore.toggle(card.id)"
              :title="wishlistStore.isWishlisted(card.id) ? 'Remove from saved' : 'Save venue'"
            >
              <svg
                class="w-3.5 h-3.5 transition-colors"
                :class="wishlistStore.isWishlisted(card.id) ? 'text-white' : 'text-gray-400'"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
          </div>

          <!-- ── Card body ──────────────────────────────────────────────── -->
          <div class="p-4 flex flex-col flex-1">
            <!-- Venue name -->
            <h3 class="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-1">{{ card.title }}</h3>

            <!-- Location -->
            <p v-if="card.location" class="text-gray-400 text-xs flex items-center gap-1 mb-3">
              <svg class="w-3 h-3 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span class="truncate">{{ card.location }}</span>
            </p>

            <!-- Rating + Price row -->
            <div class="flex items-center justify-between mt-auto mb-3">
              <!-- Stars + count -->
              <div class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span class="text-gray-800 text-xs font-bold">
                  {{ card.rating > 0 ? card.rating.toFixed(1) : '—' }}
                </span>
                <span v-if="card.reviewCount > 0" class="text-gray-400 text-xs">({{ card.reviewCount }})</span>
              </div>

              <!-- Price -->
              <div class="text-right">
                <span class="text-orange-500 font-black text-base leading-none">{{ formatPrice(card) }}</span>
                <span v-if="card.lowestPrice" class="text-gray-400 text-[10px] block leading-none mt-0.5">per hour</span>
              </div>
            </div>

            <!-- View Details button -->
            <button
              @click.stop="goToVenue(card.id)"
              class="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all duration-200"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>
