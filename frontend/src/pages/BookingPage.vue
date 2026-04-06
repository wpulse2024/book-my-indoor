<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '@/stores/booking.store'
import { useAuthStore } from '@/stores/auth.store'
import AppButton from '@/components/common/AppButton.vue'
import AppSpinner from '@/components/common/AppSpinner.vue'

const router = useRouter()
const bookingStore = useBookingStore()
const auth = useAuthStore()

const paymentMethod = ref<'wallet' | 'sslcommerz'>('wallet')
const notes = ref('')
const error = ref('')
const success = ref(false)

const draft = computed(() => bookingStore.draft)
const canUseWallet = computed(
  () => bookingStore.walletBalance >= (draft.value.slot?.effectivePrice ?? 0),
)

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`
}

async function confirmBooking() {
  if (!draft.value.slot) return
  error.value = ''
  try {
    const booking = await bookingStore.createBooking({
      slotId: draft.value.slot.id,
      bookingDate: draft.value.date,
      paymentMethod: paymentMethod.value,
      notes: notes.value || undefined,
    })
    if (paymentMethod.value === 'sslcommerz') {
      // Redirect to payment gateway (booking.paymentGatewayUrl would come from API)
      window.location.href = `/bookings/${booking.id}`
    } else {
      success.value = true
      await bookingStore.fetchWallet()
    }
  } catch (e: unknown) {
    error.value = (e as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Booking failed. Please try again.'
  }
}

onMounted(() => {
  if (!draft.value.slot || !draft.value.venue) {
    router.push('/venues')
  }
  bookingStore.fetchWallet()
})
</script>

<template>
  <div class="booking-page">
    <div class="container booking-page__inner">
      <div v-if="success" class="booking-success">
        <div class="booking-success__icon">✅</div>
        <h2 class="booking-success__title">Booking Confirmed!</h2>
        <p class="booking-success__subtitle">Your slot has been booked. Check your phone for a confirmation SMS.</p>
        <div class="booking-success__actions">
          <RouterLink to="/bookings" class="btn btn--primary">View My Bookings</RouterLink>
          <RouterLink to="/venues" class="btn btn--outline">Book Another</RouterLink>
        </div>
      </div>

      <template v-else-if="draft.slot && draft.venue">
        <div class="booking-page__header">
          <RouterLink :to="`/venues/${draft.venue.slug}`" class="booking-page__back">
            ← Back to Venue
          </RouterLink>
          <h1 class="booking-page__title">Confirm Booking</h1>
        </div>

        <div class="booking-page__layout">
          <!-- Summary -->
          <div class="booking-summary">
            <h2 class="booking-summary__heading">Booking Summary</h2>

            <div class="booking-summary__venue">
              <div v-if="draft.venue.coverImage" class="booking-summary__venue-img">
                <img :src="draft.venue.coverImage" :alt="draft.venue.name" />
              </div>
              <div class="booking-summary__venue-info">
                <span class="font-bold text-slate-900">{{ draft.venue.name }}</span>
                <span class="text-sm text-slate-500">📍 {{ draft.venue.area }}, {{ draft.venue.city }}</span>
              </div>
            </div>

            <hr class="divider" />

            <div class="booking-summary__details">
              <div class="booking-summary__row">
                <span>Slot</span>
                <span class="font-semibold">{{ draft.slot.name }}</span>
              </div>
              <div class="booking-summary__row">
                <span>Date</span>
                <span class="font-semibold">{{ new Date(draft.date).toLocaleDateString('en-BD', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
              </div>
              <div class="booking-summary__row">
                <span>Time</span>
                <span class="font-semibold">{{ formatTime(draft.slot.startTime) }} – {{ formatTime(draft.slot.endTime) }}</span>
              </div>
              <div class="booking-summary__row">
                <span>Duration</span>
                <span class="font-semibold">{{ draft.slot.durationMinutes }} min</span>
              </div>
            </div>

            <hr class="divider" />

            <div class="booking-summary__row booking-summary__row--total">
              <span>Total</span>
              <span>৳{{ draft.slot.effectivePrice }}</span>
            </div>
          </div>

          <!-- Payment -->
          <div class="payment-panel">
            <h2 class="payment-panel__heading">Payment Method</h2>

            <div class="payment-panel__methods">
              <!-- Wallet -->
              <label :class="['payment-method', { 'payment-method--selected': paymentMethod === 'wallet' }]">
                <input v-model="paymentMethod" type="radio" value="wallet" class="sr-only" />
                <div class="payment-method__icon">💰</div>
                <div class="payment-method__info">
                  <span class="payment-method__name">Wallet Balance</span>
                  <span class="payment-method__desc">৳{{ bookingStore.walletBalance.toFixed(2) }} available</span>
                </div>
                <span v-if="!canUseWallet" class="badge badge--red text-xs">Insufficient</span>
                <div class="payment-method__radio" />
              </label>

              <!-- Online payment -->
              <label :class="['payment-method', { 'payment-method--selected': paymentMethod === 'sslcommerz' }]">
                <input v-model="paymentMethod" type="radio" value="sslcommerz" class="sr-only" />
                <div class="payment-method__icon">💳</div>
                <div class="payment-method__info">
                  <span class="payment-method__name">Online Payment</span>
                  <span class="payment-method__desc">bKash, Nagad, Card via SSLCommerz</span>
                </div>
                <div class="payment-method__radio" />
              </label>
            </div>

            <!-- Notes -->
            <div class="form-group mt-5">
              <label class="form-label">Special Requests (optional)</label>
              <textarea
                v-model="notes"
                class="form-input"
                rows="3"
                placeholder="e.g. Need extra balls, specific court..."
              />
            </div>

            <!-- Booker info -->
            <div class="payment-panel__user">
              <div class="payment-panel__user-avatar">{{ auth.user?.name.charAt(0).toUpperCase() }}</div>
              <div>
                <p class="font-semibold text-slate-800 text-sm">{{ auth.user?.name }}</p>
                <p class="text-xs text-slate-500">{{ auth.user?.phone }}</p>
              </div>
            </div>

            <p v-if="error" class="text-sm text-red-600 mt-3 p-3 bg-red-50 rounded-lg">{{ error }}</p>

            <AppButton
              :loading="bookingStore.isLoading"
              :disabled="paymentMethod === 'wallet' && !canUseWallet"
              full
              size="lg"
              class="mt-5"
              @click="confirmBooking"
            >
              {{ paymentMethod === 'wallet' ? `Pay ৳${draft.slot.effectivePrice} from Wallet` : `Pay ৳${draft.slot.effectivePrice} Online` }}
            </AppButton>

            <p class="text-xs text-center text-slate-400 mt-3">
              By confirming, you agree to our <a href="#" class="underline">Terms</a> and <a href="#" class="underline">Refund Policy</a>.
            </p>
          </div>
        </div>
      </template>

      <div v-else class="booking-page__empty">
        <AppSpinner size="lg" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.booking-page {
  padding-block: 2.5rem 4rem;
  background: $color-surface;
  min-height: 100vh;

  &__inner { max-width: 960px; }

  &__header { margin-bottom: 2rem; }

  &__back {
    font-size: 0.875rem;
    color: $color-muted;
    text-decoration: none;
    &:hover { color: $color-primary; }
  }

  &__title {
    font-size: 1.75rem;
    font-weight: 800;
    color: $color-dark;
    margin-top: 0.5rem;
  }

  &__layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;

    @media (min-width: $bp-md) { grid-template-columns: 1fr 1fr; }
  }

  &__empty {
    display: flex;
    justify-content: center;
    padding: 6rem;
  }
}

.booking-summary {
  background: $color-white;
  border-radius: $radius-card;
  padding: 1.5rem;
  border: 1px solid $color-border;
  height: fit-content;

  &__heading {
    font-size: 1rem;
    font-weight: 700;
    color: $color-dark;
    margin-bottom: 1.25rem;
  }

  &__venue {
    display: flex;
    gap: 0.875rem;
    align-items: center;
  }

  &__venue-img {
    width: 4rem;
    height: 4rem;
    border-radius: 0.625rem;
    overflow: hidden;
    flex-shrink: 0;

    img { width: 100%; height: 100%; object-fit: cover; }
  }

  &__venue-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9375rem;
    color: $color-muted;

    &--total {
      font-size: 1.125rem;
      font-weight: 800;
      color: $color-dark;
      margin-top: 0.25rem;

      span:last-child { color: $color-primary; font-size: 1.5rem; }
    }
  }
}

.payment-panel {
  background: $color-white;
  border-radius: $radius-card;
  padding: 1.5rem;
  border: 1px solid $color-border;

  &__heading {
    font-size: 1rem;
    font-weight: 700;
    color: $color-dark;
    margin-bottom: 1.25rem;
  }

  &__methods {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1.25rem;
    padding: 0.875rem 1rem;
    background: $color-surface;
    border-radius: $radius-btn;
    border: 1px solid $color-border;
  }

  &__user-avatar {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    background: $color-primary;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.875rem;
    flex-shrink: 0;
  }
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem;
  border: 1.5px solid $color-border;
  border-radius: $radius-btn;
  cursor: pointer;
  transition: all $transition-base;

  &--selected {
    border-color: $color-primary;
    background: $color-primary-light;
  }

  &__icon { font-size: 1.5rem; flex-shrink: 0; }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  &__name { font-size: 0.9375rem; font-weight: 600; color: $color-dark; }
  &__desc { font-size: 0.8125rem; color: $color-muted; }

  &__radio {
    width: 1.125rem;
    height: 1.125rem;
    border-radius: 50%;
    border: 2px solid $color-border;
    flex-shrink: 0;
    transition: all $transition-base;

    .payment-method--selected & {
      border-color: $color-primary;
      background: $color-primary;
      box-shadow: inset 0 0 0 3px white;
    }
  }
}

.booking-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 5rem 2rem;
  background: $color-white;
  border-radius: $radius-card;
  border: 1px solid $color-border;

  &__icon { font-size: 4rem; margin-bottom: 1rem; }
  &__title { font-size: 1.75rem; font-weight: 800; color: $color-dark; }
  &__subtitle { font-size: 1rem; color: $color-muted; margin-top: 0.5rem; max-width: 28rem; line-height: 1.65; }
  &__actions { display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap; justify-content: center; }
}
</style>
