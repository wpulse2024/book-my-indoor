<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppBadge from '@/components/common/AppBadge.vue'
import type { Venue, VenueType } from '@/types'

const props = defineProps<{ venue: Venue }>()

const typeLabel: Record<VenueType, string> = {
  cricket_turf: '🏏 Cricket Turf',
  badminton: '🏸 Badminton',
  futsal: '⚽ Futsal',
  basketball: '🏀 Basketball',
  tennis: '🎾 Tennis',
  swimming: '🏊 Swimming',
  gym: '💪 Gym',
  yoga_studio: '🧘 Yoga Studio',
  other: '🏟️ Indoor Venue',
}

const venueType = computed(() => typeLabel[props.venue.type] ?? typeLabel.other)

const stars = computed(() =>
  Array.from({ length: 5 }, (_, i) => (i < Math.round(props.venue.rating) ? '★' : '☆')).join(''),
)
</script>

<template>
  <RouterLink :to="`/venues/${venue.slug}`" class="venue-card card card--interactive">
    <!-- Image -->
    <div class="venue-card__image">
      <img
        v-if="venue.coverImage"
        :src="venue.coverImage"
        :alt="venue.name"
        loading="lazy"
      />
      <div v-else class="venue-card__image-placeholder">
        <span>🏟️</span>
      </div>

      <div class="venue-card__type-tag">{{ venueType }}</div>

      <div v-if="venue.distanceKm !== undefined" class="venue-card__distance">
        📍 {{ venue.distanceKm.toFixed(1) }} km
      </div>
    </div>

    <!-- Content -->
    <div class="venue-card__body">
      <div class="venue-card__header">
        <h3 class="venue-card__name">{{ venue.name }}</h3>
        <AppBadge variant="green" v-if="venue.isActive">Open</AppBadge>
      </div>

      <p class="venue-card__area">📍 {{ venue.area }}, {{ venue.city }}</p>

      <div class="venue-card__footer">
        <div class="venue-card__rating">
          <span class="stars text-sm">{{ stars }}</span>
          <span class="venue-card__rating-count">{{ venue.rating.toFixed(1) }} ({{ venue.reviewCount }})</span>
        </div>
        <div class="venue-card__price">
          <span class="venue-card__price-from">from</span>
          <span class="venue-card__price-amount">৳{{ venue.lowestPrice ?? '—' }}</span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<style lang="scss" scoped>
.venue-card {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;

  &__image {
    position: relative;
    aspect-ratio: 16 / 10;
    overflow: hidden;
    background: #f1f5f9;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    &:hover img { transform: scale(1.04); }

    &-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      background: linear-gradient(135deg, #e2e8f0, #f1f5f9);
    }
  }

  &__type-tag {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    background: rgb(0 0 0 / 0.55);
    backdrop-filter: blur(8px);
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.625rem;
    border-radius: 99px;
    border: 1px solid rgb(255 255 255 / 0.15);
  }

  &__distance {
    position: absolute;
    bottom: 0.75rem;
    right: 0.75rem;
    background: rgb(0 0 0 / 0.55);
    backdrop-filter: blur(8px);
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.625rem;
    border-radius: 99px;
  }

  &__body {
    padding: 1rem 1.125rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    flex: 1;
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__name {
    font-size: 1rem;
    font-weight: 700;
    color: $color-dark;
    line-height: 1.3;
  }

  &__area {
    font-size: 0.8125rem;
    color: $color-muted;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.5rem;
  }

  &__rating {
    display: flex;
    align-items: center;
    gap: 0.25rem;

    &-count { font-size: 0.8125rem; color: $color-muted; }
  }

  &__price {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;

    &-from { font-size: 0.75rem; color: $color-muted; }
    &-amount { font-size: 1rem; font-weight: 700; color: $color-primary; }
  }
}
</style>
