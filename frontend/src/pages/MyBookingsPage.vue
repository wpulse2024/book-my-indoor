<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TheNavbar from '@/components/TheNavbar.vue'
import AccountSidebar from '@/components/account/AccountSidebar.vue'
import WalletCard from '@/components/account/WalletCard.vue'
import ActivityItem from '@/components/account/ActivityItem.vue'
import SavedVenueCard from '@/components/account/SavedVenueCard.vue'
import ReviewModal from '@/components/ReviewModal.vue'
import { bookingApi, assetUrl } from '@/services/api'
import { useAuthStore } from '@/stores/auth.store'
import { useWishlistStore } from '@/stores/wishlist.store'

const router = useRouter()
const authStore = useAuthStore()
const wishlistStore = useWishlistStore()

// Real bookings from API
const rawBookings = ref<any[]>([])
const loadingBookings = ref(true)
const bookingsError = ref('')

// Review modal state
const reviewTarget = ref<{ bookingId: string; venueId: string; venueName: string } | null>(null)
const reviewedBookingIds = ref<Set<string>>(new Set())

function formatTime(t: string): string {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

function formatBookingDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function statusLabel(status: string): 'confirmed' | 'paid' | 'cancelled' {
  if (status === 'completed') return 'paid'
  if (status === 'cancelled') return 'cancelled'
  return 'confirmed'
}

onMounted(async () => {
  try {
    const res = await bookingApi.list(1)
    const data = res.data
    rawBookings.value = Array.isArray(data) ? data : (data?.items ?? [])
  } catch (err: any) {
    bookingsError.value = err.response?.data?.message ?? 'Failed to load bookings'
  } finally {
    loadingBookings.value = false
  }

  if (authStore.isLoggedIn && !wishlistStore.initialized) {
    wishlistStore.fetch()
  }
})

function openReview(booking: any) {
  reviewTarget.value = {
    bookingId: booking._id,
    venueId: booking.venueId?._id ?? booking.venueId,
    venueName: booking.venueId?.title ?? 'Venue',
  }
}

function onReviewSubmitted(bookingId: string) {
  reviewedBookingIds.value.add(bookingId)
}

const statusConfig = {
  confirmed: { label: 'Confirmed', dot: 'bg-green-400', bg: 'bg-green-500' },
  paid:      { label: 'Paid',      dot: 'bg-blue-300',  bg: 'bg-blue-600' },
  cancelled: { label: 'Cancelled', dot: 'bg-red-400',   bg: 'bg-red-500' },
}

const activities = [
  {
    type: 'payment' as const,
    title: 'Payment for Velocity Arena',
    subtitle: 'Oct 19, 2023 • Trans ID: #CK-99281',
    amount: '- ৳800',
    amountColor: 'text-red-500',
    linkLabel: 'Receipt',
    link: '#',
  },
  {
    type: 'wallet' as const,
    title: 'Wallet Top-up',
    subtitle: 'Oct 12, 2023 • via Nagad',
    amount: '+ ৳2,000',
    amountColor: 'text-green-500',
  },
]

</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <TheNavbar active="bookings" />

    <main class="max-w-6xl mx-auto px-6 py-8">
      <div class="flex gap-8 items-start">

        <!-- Sidebar -->
        <AccountSidebar />

        <!-- Main content -->
        <div class="flex-1 min-w-0 space-y-6">

          <!-- Header + Wallet -->
          <div class="bg-white rounded-2xl border border-gray-100 p-6 flex items-start justify-between gap-6">
            <div>
              <h1 class="font-black text-gray-900 text-2xl mb-1">My Bookings</h1>
              <p class="text-gray-400 text-sm">Track and manage your upcoming indoor court sessions.</p>
            </div>
            <WalletCard />
          </div>

          <!-- Upcoming Bookings -->
          <div class="bg-white rounded-2xl border border-gray-100 p-6">
            <div class="flex items-center justify-between mb-5">
              <h2 class="font-black text-gray-900 text-lg">Upcoming Bookings</h2>
            </div>

            <!-- Loading -->
            <div v-if="loadingBookings" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="i in 2" :key="i" class="rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div class="bg-gray-200" style="height: 180px;"></div>
                <div class="p-4 space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            </div>

            <!-- Error -->
            <div v-else-if="bookingsError" class="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm">
              {{ bookingsError }}
            </div>

            <!-- Empty -->
            <div v-else-if="rawBookings.length === 0" class="text-center py-12 text-gray-400">
              <svg class="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p class="font-black text-gray-300 text-lg">No bookings yet</p>
              <p class="text-sm mt-1">Book a venue to get started!</p>
            </div>

            <!-- Bookings grid -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                v-for="booking in rawBookings"
                :key="booking._id"
                class="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <!-- Image -->
                <div class="relative overflow-hidden" style="height: 180px;">
                  <img
                    :src="assetUrl(booking.venueId?.images?.[0]) || 'https://picsum.photos/seed/venue/600/400'"
                    :alt="booking.venueId?.title"
                    class="w-full h-full object-cover"
                  />
                  <span
                    :class="['absolute top-3 left-3 flex items-center gap-1.5 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wide', statusConfig[statusLabel(booking.status)].bg]"
                  >
                    <span :class="['w-1.5 h-1.5 rounded-full', statusConfig[statusLabel(booking.status)].dot, booking.status === 'confirmed' ? 'animate-pulse' : '']"></span>
                    {{ statusConfig[statusLabel(booking.status)].label }}
                  </span>
                </div>

                <!-- Info -->
                <div class="p-4">
                  <div class="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h3 class="font-black text-gray-900 text-sm">{{ booking.venueId?.title ?? 'Unknown Venue' }}</h3>
                      <p class="text-gray-400 text-xs mt-0.5">{{ booking.venueId?.location?.title ?? '' }}</p>
                    </div>
                    <div class="text-right flex-shrink-0">
                      <p class="text-blue-700 font-black text-xs">{{ formatBookingDate(booking.bookingDate) }}</p>
                      <p class="text-gray-400 text-xs mt-0.5">{{ formatTime(booking.startTime) }} – {{ formatTime(booking.endTime) }}</p>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center gap-2 mt-4">
                    <button class="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold text-xs py-2.5 rounded-xl hover:border-blue-300 hover:text-blue-700 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 3.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z"/>
                      </svg>
                      View QR Code
                    </button>

                    <!-- Review button (hidden for cancelled bookings) -->
                    <button
                      v-if="booking.status !== 'cancelled'"
                      @click="openReview(booking)"
                      :disabled="reviewedBookingIds.has(booking._id)"
                      class="w-9 h-9 flex items-center justify-center rounded-xl transition-colors flex-shrink-0"
                      :class="reviewedBookingIds.has(booking._id)
                        ? 'border border-green-200 text-green-500 cursor-default'
                        : 'border border-gray-200 text-gray-400 hover:border-orange-300 hover:text-orange-500'"
                      :title="reviewedBookingIds.has(booking._id) ? 'Reviewed' : 'Write a Review'"
                    >
                      <!-- Star icon -->
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom: Recent Activity + Saved Venues -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            <!-- Recent Activity -->
            <div class="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 class="font-black text-gray-900 text-lg mb-2">Recent Activity</h2>
              <div>
                <ActivityItem
                  v-for="activity in activities"
                  :key="activity.title"
                  v-bind="activity"
                />
              </div>
            </div>

            <!-- Saved Venues -->
            <div class="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 class="font-black text-gray-900 text-lg mb-4">Saved Venues</h2>

              <!-- Not logged in -->
              <div v-if="!authStore.isLoggedIn" class="text-center py-8">
                <svg class="w-10 h-10 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                <p class="text-gray-400 text-sm font-semibold">Log in to save venues</p>
                <button
                  @click="router.push('/login')"
                  class="mt-3 text-xs text-orange-500 font-black hover:underline"
                >
                  Sign In
                </button>
              </div>

              <!-- Loading -->
              <div v-else-if="wishlistStore.loading" class="space-y-3">
                <div v-for="i in 2" :key="i" class="rounded-2xl bg-gray-100 animate-pulse" style="height: 140px;"></div>
              </div>

              <!-- Empty -->
              <div v-else-if="wishlistStore.venues.length === 0" class="text-center py-8">
                <svg class="w-10 h-10 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                <p class="text-gray-400 text-sm">No saved venues yet.</p>
                <button
                  @click="router.push('/discover')"
                  class="mt-3 text-xs text-orange-500 font-black hover:underline"
                >
                  Browse Venues
                </button>
              </div>

              <!-- List -->
              <div v-else class="space-y-3">
                <SavedVenueCard
                  v-for="venue in wishlistStore.venues"
                  :key="venue.venueId"
                  :venue-id="venue.venueId"
                  :slug="venue.slug"
                  :name="venue.name"
                  :rating="venue.rating"
                  :review-count="venue.reviewCount"
                  :image="venue.image"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>

    <!-- Review Modal -->
    <ReviewModal
      v-if="reviewTarget"
      :booking-id="reviewTarget.bookingId"
      :venue-id="reviewTarget.venueId"
      :venue-name="reviewTarget.venueName"
      @close="reviewTarget = null"
      @submitted="onReviewSubmitted"
    />
  </div>
</template>
