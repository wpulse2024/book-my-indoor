<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBookingStore } from '@/stores/booking.store'
import AppBadge from '@/components/common/AppBadge.vue'
import AppSpinner from '@/components/common/AppSpinner.vue'
import type { Booking, BookingStatus } from '@/types'

const bookingStore = useBookingStore()
const activeTab = ref<'upcoming' | 'past' | 'cancelled'>('upcoming')
const cancellingId = ref<string | null>(null)
const qrBooking = ref<Booking | null>(null)
const qrDataUrl = ref('')

const badgeVariant: Record<BookingStatus, 'green' | 'orange' | 'gray' | 'red'> = {
  confirmed: 'green',
  pending: 'orange',
  completed: 'gray',
  cancelled: 'red',
}

const filtered = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return bookingStore.bookings.filter((b) => {
    if (activeTab.value === 'upcoming') return ['confirmed', 'pending'].includes(b.status) && b.bookingDate >= today
    if (activeTab.value === 'cancelled') return b.status === 'cancelled'
    return b.status === 'completed' || b.bookingDate < today
  })
})

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-BD', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`
}

async function cancelBooking(id: string) {
  if (!confirm('Are you sure you want to cancel this booking?')) return
  cancellingId.value = id
  try { await bookingStore.cancelBooking(id) }
  finally { cancellingId.value = null }
}

async function showQr(booking: Booking) {
  qrBooking.value = booking
  qrDataUrl.value = ''
  try {
    const { bookingApi } = await import('@/services/api')
    const res = await bookingApi.qr(booking.id)
    qrDataUrl.value = res.data.data.qrDataUrl
  } catch { qrDataUrl.value = '' }
}

onMounted(() => bookingStore.fetchBookings())
</script>

<template>
  <div class="bookings-page">
    <div class="container">
      <h1 class="bookings-page__title">My Bookings</h1>

      <!-- Tabs -->
      <div class="bookings-page__tabs">
        <button
          v-for="tab in (['upcoming', 'past', 'cancelled'] as const)"
          :key="tab"
          :class="['bookings-page__tab', { 'bookings-page__tab--active': activeTab === tab }]"
          @click="activeTab = tab"
        >
          {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="bookingStore.isLoading" class="bookings-page__loading">
        <AppSpinner size="lg" />
      </div>

      <!-- Empty -->
      <div v-else-if="filtered.length === 0" class="bookings-page__empty">
        <span class="bookings-page__empty-icon">📅</span>
        <h3>No {{ activeTab }} bookings</h3>
        <RouterLink v-if="activeTab === 'upcoming'" to="/venues" class="btn btn--primary mt-4">
          Find a Venue
        </RouterLink>
      </div>

      <!-- Booking cards -->
      <div v-else class="bookings-list">
        <div v-for="booking in filtered" :key="booking.id" class="booking-card">
          <div class="booking-card__header">
            <div>
              <h3 class="booking-card__venue-name">{{ booking.venue.name }}</h3>
              <p class="booking-card__venue-area">📍 {{ booking.venue.area }}, {{ booking.venue.city }}</p>
            </div>
            <AppBadge :variant="badgeVariant[booking.status]">
              {{ booking.status }}
            </AppBadge>
          </div>

          <div class="booking-card__details">
            <div class="booking-card__detail">
              <span class="booking-card__detail-label">Date</span>
              <span class="booking-card__detail-value">{{ formatDate(booking.bookingDate) }}</span>
            </div>
            <div class="booking-card__detail">
              <span class="booking-card__detail-label">Time</span>
              <span class="booking-card__detail-value">{{ formatTime(booking.startTime) }} – {{ formatTime(booking.endTime) }}</span>
            </div>
            <div class="booking-card__detail">
              <span class="booking-card__detail-label">Slot</span>
              <span class="booking-card__detail-value">{{ booking.slot.name }}</span>
            </div>
            <div class="booking-card__detail">
              <span class="booking-card__detail-label">Amount</span>
              <span class="booking-card__detail-value booking-card__amount">৳{{ booking.totalAmount }}</span>
            </div>
          </div>

          <div class="booking-card__actions">
            <button
              v-if="booking.status === 'confirmed'"
              class="btn btn--outline btn--sm"
              @click="showQr(booking)"
            >
              📱 Show QR
            </button>
            <RouterLink :to="`/venues/${booking.venue.slug}`" class="btn btn--ghost btn--sm">
              View Venue
            </RouterLink>
            <button
              v-if="['confirmed', 'pending'].includes(booking.status)"
              class="btn btn--ghost btn--sm text-red-500"
              :disabled="cancellingId === booking.id"
              @click="cancelBooking(booking.id)"
            >
              {{ cancellingId === booking.id ? 'Cancelling…' : 'Cancel' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Modal -->
    <Teleport to="body">
      <div v-if="qrBooking" class="modal-backdrop" @click.self="qrBooking = null">
        <div class="modal text-center">
          <h2 class="text-lg font-bold mb-1">Booking QR Code</h2>
          <p class="text-sm text-slate-500 mb-4">Show this at the venue entrance for check-in</p>

          <div class="qr-placeholder">
            <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR Code" class="w-48 h-48 mx-auto" />
            <div v-else class="flex items-center justify-center w-48 h-48 mx-auto bg-slate-50 rounded-xl border">
              <AppSpinner />
            </div>
          </div>

          <div class="mt-4 text-sm">
            <p class="font-semibold text-slate-800">{{ qrBooking.venue.name }}</p>
            <p class="text-slate-500">{{ formatDate(qrBooking.bookingDate) }} · {{ formatTime(qrBooking.startTime) }}</p>
          </div>
          <button class="btn btn--outline btn--full mt-5" @click="qrBooking = null">Close</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.bookings-page {
  padding-block: 2.5rem 4rem;

  &__title {
    font-size: 1.75rem;
    font-weight: 800;
    color: $color-dark;
    margin-bottom: 1.5rem;
  }

  &__tabs {
    display: flex;
    gap: 0.25rem;
    background: $color-surface;
    border-radius: 0.625rem;
    padding: 0.25rem;
    border: 1px solid $color-border;
    width: fit-content;
    margin-bottom: 2rem;
  }

  &__tab {
    padding: 0.5rem 1.25rem;
    border-radius: 0.5rem;
    font-size: 0.9375rem;
    font-weight: 600;
    color: $color-muted;
    background: none;
    border: none;
    cursor: pointer;
    transition: all $transition-base;

    &--active {
      background: $color-white;
      color: $color-primary;
      box-shadow: $shadow-card;
    }
  }

  &__loading, &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 20rem;
    gap: 0.75rem;
  }

  &__empty-icon { font-size: 3rem; }
  &__empty h3 { font-size: 1.125rem; font-weight: 700; color: $color-dark; }
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.booking-card {
  background: $color-white;
  border-radius: $radius-card;
  border: 1px solid $color-border;
  padding: 1.25rem 1.5rem;
  transition: box-shadow $transition-smooth;

  &:hover { box-shadow: $shadow-card-hover; }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  &__venue-name { font-size: 1rem; font-weight: 700; color: $color-dark; }
  &__venue-area { font-size: 0.8125rem; color: $color-muted; margin-top: 0.125rem; }

  &__details {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    padding: 1rem;
    background: $color-surface;
    border-radius: $radius-btn;
    margin-bottom: 1rem;

    @media (min-width: $bp-sm) { grid-template-columns: repeat(4, 1fr); }
  }

  &__detail {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  &__detail-label { font-size: 0.75rem; color: $color-muted; font-weight: 500; }
  &__detail-value { font-size: 0.875rem; font-weight: 600; color: $color-dark-soft; }
  &__amount { color: $color-primary !important; }

  &__actions {
    display: flex;
    gap: 0.625rem;
    flex-wrap: wrap;
  }
}
</style>
