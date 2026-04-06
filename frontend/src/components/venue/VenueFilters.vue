<script setup lang="ts">
import { ref } from 'vue'
import type { VenueFilters, VenueType } from '@/types'

const props = defineProps<{ modelValue: VenueFilters }>()
const emit = defineEmits<{
  'update:modelValue': [VenueFilters]
  search: []
}>()

const venueTypes: { value: VenueType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'cricket_turf', label: '🏏 Cricket Turf' },
  { value: 'badminton', label: '🏸 Badminton' },
  { value: 'futsal', label: '⚽ Futsal' },
  { value: 'basketball', label: '🏀 Basketball' },
  { value: 'tennis', label: '🎾 Tennis' },
  { value: 'swimming', label: '🏊 Swimming' },
  { value: 'gym', label: '💪 Gym' },
  { value: 'yoga_studio', label: '🧘 Yoga Studio' },
]

const showAdvanced = ref(false)

function update(key: keyof VenueFilters, value: unknown) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function reset() {
  emit('update:modelValue', {
    search: '', date: '', timeFrom: '', timeTo: '',
    type: '', area: '', priceMin: null, priceMax: null,
    lat: null, lng: null, radiusKm: 10,
  })
}
</script>

<template>
  <div class="filters">
    <!-- Primary search bar -->
    <div class="filters__bar">
      <div class="filters__bar-field filters__bar-field--search">
        <span class="filters__bar-icon">🔍</span>
        <input
          :value="modelValue.search"
          type="text"
          placeholder="Search venues, areas..."
          class="filters__bar-input"
          @input="update('search', ($event.target as HTMLInputElement).value)"
          @keyup.enter="emit('search')"
        />
      </div>

      <div class="filters__bar-divider" />

      <div class="filters__bar-field">
        <span class="filters__bar-icon">📅</span>
        <input
          :value="modelValue.date"
          type="date"
          class="filters__bar-input"
          :min="new Date().toISOString().split('T')[0]"
          @change="update('date', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="filters__bar-divider" />

      <div class="filters__bar-field">
        <span class="filters__bar-icon">🏟️</span>
        <select
          :value="modelValue.type"
          class="filters__bar-input"
          @change="update('type', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="t in venueTypes" :key="t.value" :value="t.value">
            {{ t.label }}
          </option>
        </select>
      </div>

      <button class="btn btn--primary filters__search-btn" @click="emit('search')">
        Search
      </button>
    </div>

    <!-- Advanced toggle -->
    <div class="filters__advanced-toggle">
      <button class="btn btn--ghost btn--sm" @click="showAdvanced = !showAdvanced">
        {{ showAdvanced ? '▲ Hide filters' : '▼ More filters' }}
      </button>
      <button v-if="modelValue.search || modelValue.date || modelValue.type || modelValue.area" class="btn btn--ghost btn--sm text-red-500" @click="reset">
        ✕ Clear all
      </button>
    </div>

    <!-- Advanced filters -->
    <Transition name="slide-down">
      <div v-if="showAdvanced" class="filters__advanced">
        <div class="filters__advanced-grid">
          <div class="form-group">
            <label class="form-label">Area / Neighbourhood</label>
            <input
              :value="modelValue.area"
              type="text"
              class="form-input"
              placeholder="e.g. Gulshan, Dhanmondi..."
              @input="update('area', ($event.target as HTMLInputElement).value)"
            />
          </div>

          <div class="form-group">
            <label class="form-label">From Time</label>
            <input
              :value="modelValue.timeFrom"
              type="time"
              class="form-input"
              @change="update('timeFrom', ($event.target as HTMLInputElement).value)"
            />
          </div>

          <div class="form-group">
            <label class="form-label">To Time</label>
            <input
              :value="modelValue.timeTo"
              type="time"
              class="form-input"
              @change="update('timeTo', ($event.target as HTMLInputElement).value)"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Min Price (৳)</label>
            <input
              :value="modelValue.priceMin ?? ''"
              type="number"
              class="form-input"
              placeholder="0"
              min="0"
              @input="update('priceMin', Number(($event.target as HTMLInputElement).value) || null)"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Max Price (৳)</label>
            <input
              :value="modelValue.priceMax ?? ''"
              type="number"
              class="form-input"
              placeholder="5000"
              min="0"
              @input="update('priceMax', Number(($event.target as HTMLInputElement).value) || null)"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Radius (km)</label>
            <input
              :value="modelValue.radiusKm"
              type="range"
              min="1"
              max="50"
              class="w-full mt-2"
              @input="update('radiusKm', Number(($event.target as HTMLInputElement).value))"
            />
            <span class="text-sm text-slate-500">{{ modelValue.radiusKm }} km</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Active filter chips -->
    <div v-if="modelValue.type || modelValue.area || modelValue.date" class="filters__chips">
      <span v-if="modelValue.date" class="filters__chip">
        📅 {{ modelValue.date }}
        <button @click="update('date', '')">✕</button>
      </span>
      <span v-if="modelValue.type" class="filters__chip">
        {{ venueTypes.find(t => t.value === modelValue.type)?.label }}
        <button @click="update('type', '')">✕</button>
      </span>
      <span v-if="modelValue.area" class="filters__chip">
        📍 {{ modelValue.area }}
        <button @click="update('area', '')">✕</button>
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filters {
  background: $color-white;
  border-radius: $radius-card;
  border: 1px solid $color-border;
  padding: 1.25rem;
  box-shadow: $shadow-card;

  &__bar {
    display: flex;
    align-items: center;
    gap: 0;
    border: 1.5px solid $color-border;
    border-radius: 0.75rem;
    overflow: hidden;
    background: $color-white;

    @media (max-width: $bp-md) {
      flex-direction: column;
      border-radius: $radius-btn;
    }
  }

  &__bar-field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    flex: 1;
    min-width: 0;

    &--search { flex: 2; }

    @media (max-width: $bp-md) {
      width: 100%;
      border-bottom: 1px solid $color-border;
    }
  }

  &__bar-icon { font-size: 1rem; flex-shrink: 0; }

  &__bar-input {
    border: none;
    outline: none;
    width: 100%;
    font-size: 0.9375rem;
    color: $color-dark;
    background: transparent;
    &::placeholder { color: #94a3b8; }
  }

  &__bar-divider {
    width: 1px;
    height: 2rem;
    background: $color-border;
    flex-shrink: 0;
    @media (max-width: $bp-md) { display: none; }
  }

  &__search-btn {
    margin: 0.5rem;
    flex-shrink: 0;
    border-radius: 0.5rem !important;
    @media (max-width: $bp-md) {
      width: calc(100% - 1rem);
    }
  }

  &__advanced-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  &__advanced {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid $color-border;
  }

  &__advanced-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;

    @media (min-width: $bp-md) { grid-template-columns: repeat(3, 1fr); }
    @media (min-width: $bp-lg) { grid-template-columns: repeat(6, 1fr); }
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  &__chip {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.625rem;
    background: $color-primary-light;
    color: $color-primary-dark;
    border-radius: 99px;
    font-size: 0.8125rem;
    font-weight: 600;

    button {
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      font-size: 0.75rem;
      line-height: 1;
      padding: 0;
      opacity: 0.7;
      &:hover { opacity: 1; }
    }
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 500px;
  opacity: 1;
}
</style>
