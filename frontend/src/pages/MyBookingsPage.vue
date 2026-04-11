<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TheNavbar from '@/components/TheNavbar.vue'
import AccountSidebar from '@/components/account/AccountSidebar.vue'
import WalletCard from '@/components/account/WalletCard.vue'
import BookingCard from '@/components/account/BookingCard.vue'
import ActivityItem from '@/components/account/ActivityItem.vue'
import SavedVenueCard from '@/components/account/SavedVenueCard.vue'
import { bookingApi, assetUrl } from '@/services/api'

// Real bookings from API
const rawBookings = ref<any[]>([])
const loadingBookings = ref(true)
const bookingsError = ref('')

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

function mapStatus(status: string): 'confirmed' | 'paid' | 'cancelled' {
  if (status === 'completed') return 'paid'
  if (status === 'cancelled') return 'cancelled'
  return 'confirmed'
}

const bookingCards = ref<{
  venueName: string
  branch: string
  date: string
  time: string
  status: 'confirmed' | 'paid' | 'cancelled'
  image: string
}[]>([])

onMounted(async () => {
  try {
    const res = await bookingApi.list(1)
    const data = res.data
    rawBookings.value = Array.isArray(data) ? data : (data?.items ?? [])
    bookingCards.value = rawBookings.value.map((b: any) => ({
      venueName: b.venueId?.title ?? 'Unknown Venue',
      branch: b.venueId?.location?.title ?? '',
      date: formatBookingDate(b.bookingDate),
      time: `${formatTime(b.startTime)} – ${formatTime(b.endTime)}`,
      status: mapStatus(b.status),
      image: assetUrl(b.venueId?.images?.[0]) || 'https://picsum.photos/seed/venue/600/400',
    }))
  } catch (err: any) {
    bookingsError.value = err.response?.data?.message ?? 'Failed to load bookings'
  } finally {
    loadingBookings.value = false
  }
})

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
    type: 'review' as const,
    title: 'Review Posted: Smash Court',
    subtitle: 'Oct 15, 2023 • 5 Stars',
    amount: '+ 50 Pts',
    amountColor: 'text-green-500',
  },
  {
    type: 'wallet' as const,
    title: 'Wallet Top-up',
    subtitle: 'Oct 12, 2023 • via Nagad',
    amount: '+ ৳2,000',
    amountColor: 'text-green-500',
  },
]

const savedVenues = [
  {
    slug: 'the-grand-slam-center',
    name: 'The Grand Slam Center',
    rating: 4.9,
    reviewCount: 210,
    image: 'https://picsum.photos/seed/grand-slam/600/400',
  },
  {
    slug: 'ping-pong-palace',
    name: 'Ping Pong Palace',
    rating: 4.7,
    reviewCount: 89,
    image: 'https://picsum.photos/seed/ping-pong/600/400',
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
            <div v-else-if="bookingCards.length === 0" class="text-center py-12 text-gray-400">
              <svg class="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p class="font-black text-gray-300 text-lg">No bookings yet</p>
              <p class="text-sm mt-1">Book a venue to get started!</p>
            </div>

            <!-- Bookings grid -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BookingCard
                v-for="(booking, idx) in bookingCards"
                :key="idx"
                v-bind="booking"
              />
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
              <div class="space-y-3">
                <SavedVenueCard
                  v-for="venue in savedVenues"
                  :key="venue.slug"
                  v-bind="venue"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  </div>
</template>
