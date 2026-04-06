<script setup lang="ts">
import TheNavbar from '@/components/TheNavbar.vue'
import AccountSidebar from '@/components/account/AccountSidebar.vue'
import WalletCard from '@/components/account/WalletCard.vue'
import BookingCard from '@/components/account/BookingCard.vue'
import ActivityItem from '@/components/account/ActivityItem.vue'
import SavedVenueCard from '@/components/account/SavedVenueCard.vue'

const bookings = [
  {
    venueName: 'Velocity Indoor Arena',
    branch: 'Banani, Branch 04',
    date: 'Tomorrow',
    time: '6:00 PM - 8:00 PM',
    status: 'confirmed' as const,
    image: 'https://picsum.photos/seed/velocity-arena/600/400',
  },
  {
    venueName: 'Apex Badminton Club',
    branch: 'Uttara, Sector 7',
    date: 'Sat, Oct 24',
    time: '10:00 AM - 11:30 AM',
    status: 'paid' as const,
    image: 'https://picsum.photos/seed/apex-badminton/600/400',
  },
]

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
              <a href="#" class="text-blue-700 text-sm font-bold hover:underline flex items-center gap-1">
                View Calendar
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BookingCard
                v-for="booking in bookings"
                :key="booking.venueName"
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
