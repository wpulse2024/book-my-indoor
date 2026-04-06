<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useVenueStore } from '@/stores/venue.store'
import { useBookingStore } from '@/stores/booking.store'
import { useAuthStore } from '@/stores/auth.store'
import SlotPicker from '@/components/venue/SlotPicker.vue'
import AppBadge from '@/components/common/AppBadge.vue'
import AppSpinner from '@/components/common/AppSpinner.vue'
import AuthModal from '@/components/common/AuthModal.vue'
import type { AvailableSlot } from '@/types'

const props = defineProps<{ slug: string }>()
const router = useRouter()
const venueStore = useVenueStore()
const bookingStore = useBookingStore()
const auth = useAuthStore()

const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedSlot = ref<AvailableSlot | null>(null)
const showAuth = ref(false)
const activeImage = ref(0)

const venue = computed(() => venueStore.currentVenue)

const amenityIcons: Record<string, string> = {
  parking: '🅿️', wifi: '📶', cafeteria: '☕', shower: '🚿',
  changing_room: '👕', lighting: '💡', ac: '❄️', equipment_rental: '🎾',
}

watch(selectedDate, (d) => {
  if (venue.value) venueStore.fetchAvailableSlots(venue.value.slug, d)
})

function proceed() {
  if (!selectedSlot.value || !venue.value) return
  if (!auth.isLoggedIn) { showAuth.value = true; return }
  bookingStore.setDraft(selectedSlot.value, venue.value, selectedDate.value)
  router.push({ name: 'booking', params: { slotId: selectedSlot.value.id } })
}

onMounted(async () => {
  await venueStore.fetchVenue(props.slug)
  if (venue.value) venueStore.fetchAvailableSlots(venue.value.slug, selectedDate.value)
})
</script>

<template>
  <div class="venue-detail">
    <div v-if="venueStore.isLoading && !venue" class="venue-detail__loading">
      <AppSpinner size="lg" />
    </div>

    <template v-else-if="venue">
      <!-- ── Gallery ── -->
      <div class="venue-detail__gallery">
        <div class="venue-detail__main-image">
          <img
            v-if="venue.images[activeImage] || venue.coverImage"
            :src="venue.images[activeImage] ?? venue.coverImage!"
            :alt="venue.name"
          />
          <div v-else class="venue-detail__image-placeholder">🏟️</div>
        </div>
        <div v-if="venue.images.length > 1" class="venue-detail__thumbs">
          <button
            v-for="(img, i) in venue.images.slice(0, 4)"
            :key="i"
            :class="['venue-detail__thumb', { 'venue-detail__thumb--active': i === activeImage }]"
            @click="activeImage = i"
          >
            <img :src="img" :alt="`Image ${i + 1}`" />
          </button>
        </div>
      </div>

      <!-- ── Body ── -->
      <div class="container venue-detail__body">
        <!-- Left: Info -->
        <div class="venue-detail__info">
          <!-- Header -->
          <div class="venue-detail__info-header">
            <div>
              <AppBadge variant="green">Open</AppBadge>
              <h1 class="venue-detail__name">{{ venue.name }}</h1>
              <p class="venue-detail__location">📍 {{ venue.address }}, {{ venue.area }}, {{ venue.city }}</p>
            </div>
            <div class="venue-detail__rating-block">
              <span class="venue-detail__rating-value">{{ venue.rating.toFixed(1) }}</span>
              <div class="stars text-xl">★★★★★</div>
              <span class="text-sm text-slate-500">{{ venue.reviewCount }} reviews</span>
            </div>
          </div>

          <hr class="divider" />

          <!-- About -->
          <div v-if="venue.description">
            <h2 class="venue-detail__section-title">About</h2>
            <p class="venue-detail__description">{{ venue.description }}</p>
          </div>

          <!-- Amenities -->
          <div v-if="venue.amenities.length">
            <h2 class="venue-detail__section-title">Amenities</h2>
            <div class="venue-detail__amenities">
              <span v-for="a in venue.amenities" :key="a" class="venue-detail__amenity">
                {{ amenityIcons[a] ?? '✓' }} {{ a.replace(/_/g, ' ') }}
              </span>
            </div>
          </div>

          <!-- Branches -->
          <div v-if="venue.branches.length > 1">
            <h2 class="venue-detail__section-title">Branches</h2>
            <div class="venue-detail__branches">
              <div v-for="branch in venue.branches" :key="branch.id" class="venue-detail__branch">
                <span class="font-semibold text-slate-800">{{ branch.name }}</span>
                <span class="text-sm text-slate-500">📍 {{ branch.address }}</span>
                <a :href="`tel:${branch.phone}`" class="text-sm text-primary-600 font-medium">📞 {{ branch.phone }}</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Booking panel -->
        <aside class="venue-detail__booking-panel">
          <div class="booking-panel">
            <h2 class="booking-panel__title">Book a Slot</h2>

            <!-- Date picker -->
            <div class="form-group mb-4">
              <label class="form-label">Select Date</label>
              <input
                v-model="selectedDate"
                type="date"
                class="form-input"
                :min="new Date().toISOString().split('T')[0]"
              />
            </div>

            <!-- Slot picker -->
            <SlotPicker
              v-model="selectedSlot"
              :slots="venueStore.availableSlots"
              :loading="venueStore.slotsLoading"
              :date="selectedDate"
            />

            <button
              :class="['btn btn--primary btn--full mt-4', { 'opacity-50': !selectedSlot }]"
              :disabled="!selectedSlot"
              @click="proceed"
            >
              {{ selectedSlot ? `Book for ৳${selectedSlot.effectivePrice}` : 'Select a Slot' }}
            </button>

            <p class="booking-panel__note">No payment charged until confirmation</p>
          </div>
        </aside>
      </div>
    </template>

    <div v-else class="venue-detail__not-found">
      <h2>Venue not found</h2>
      <RouterLink to="/venues" class="btn btn--primary mt-4">Browse Venues</RouterLink>
    </div>

    <AuthModal v-if="showAuth" @close="showAuth = false" />
  </div>
</template>

<style lang="scss" scoped>
.venue-detail {
  &__loading, &__not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 1rem;
  }

  &__gallery {
    width: 100%;
    background: $color-dark;
  }

  &__main-image {
    aspect-ratio: 21 / 9;
    overflow: hidden;
    max-height: 480px;

    img { width: 100%; height: 100%; object-fit: cover; }
  }

  &__image-placeholder {
    width: 100%;
    height: 100%;
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 5rem;
    background: #1e293b;
  }

  &__thumbs {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #1e293b;
    overflow-x: auto;
    justify-content: center;
  }

  &__thumb {
    width: 5rem;
    height: 3.5rem;
    border-radius: 0.5rem;
    overflow: hidden;
    border: 2px solid transparent;
    cursor: pointer;
    flex-shrink: 0;
    transition: border-color $transition-base;

    img { width: 100%; height: 100%; object-fit: cover; }

    &--active { border-color: $color-primary; }
  }

  &__body {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    padding-top: 2rem;
    padding-bottom: 4rem;

    @media (min-width: $bp-lg) { grid-template-columns: 1fr 380px; }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  &__info-header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  &__name {
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 800;
    color: $color-dark;
    margin-top: 0.375rem;
  }

  &__location {
    font-size: 0.9375rem;
    color: $color-muted;
    margin-top: 0.25rem;
  }

  &__rating-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  &__rating-value {
    font-size: 2rem;
    font-weight: 800;
    color: $color-dark;
    line-height: 1;
  }

  &__section-title {
    font-size: 1rem;
    font-weight: 700;
    color: $color-dark;
    margin-bottom: 0.75rem;
  }

  &__description {
    font-size: 0.9375rem;
    color: $color-muted;
    line-height: 1.7;
  }

  &__amenities {
    display: flex;
    flex-wrap: wrap;
    gap: 0.625rem;
  }

  &__amenity {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-btn;
    font-size: 0.875rem;
    font-weight: 500;
    color: $color-dark-soft;
    text-transform: capitalize;
  }

  &__branches {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__branch {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.875rem 1rem;
    background: $color-surface;
    border-radius: $radius-btn;
    border: 1px solid $color-border;
  }
}

.booking-panel {
  background: $color-white;
  border-radius: $radius-card;
  border: 1px solid $color-border;
  padding: 1.5rem;
  box-shadow: $shadow-card;
  position: sticky;
  top: 5rem;

  &__title {
    font-size: 1.125rem;
    font-weight: 700;
    color: $color-dark;
    margin-bottom: 1.25rem;
  }

  &__note {
    text-align: center;
    font-size: 0.8125rem;
    color: $color-muted;
    margin-top: 0.75rem;
  }
}
</style>
