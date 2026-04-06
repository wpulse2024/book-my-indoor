<script setup lang="ts">
import { computed } from 'vue'
import type { AvailableSlot } from '@/types'
import AppSpinner from '@/components/common/AppSpinner.vue'

const props = defineProps<{
  slots: AvailableSlot[]
  modelValue: AvailableSlot | null
  loading?: boolean
  date: string
}>()

const emit = defineEmits<{
  'update:modelValue': [AvailableSlot | null]
}>()

// Group slots by morning / afternoon / evening
const groups = computed(() => {
  const morning: AvailableSlot[] = []
  const afternoon: AvailableSlot[] = []
  const evening: AvailableSlot[] = []

  for (const slot of props.slots) {
    const hour = parseInt(slot.startTime.split(':')[0], 10)
    if (hour < 12) morning.push(slot)
    else if (hour < 17) afternoon.push(slot)
    else evening.push(slot)
  }

  return [
    { label: '🌅 Morning', slots: morning },
    { label: '☀️ Afternoon', slots: afternoon },
    { label: '🌆 Evening', slots: evening },
  ].filter((g) => g.slots.length > 0)
})

function selectSlot(slot: AvailableSlot) {
  if (!slot.available) return
  emit('update:modelValue', props.modelValue?.id === slot.id ? null : slot)
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`
}
</script>

<template>
  <div class="slot-picker">
    <div v-if="loading" class="slot-picker__loading">
      <AppSpinner size="md" />
      <span>Loading availability…</span>
    </div>

    <div v-else-if="!date" class="slot-picker__empty">
      <span>📅 Select a date to see available slots</span>
    </div>

    <div v-else-if="slots.length === 0" class="slot-picker__empty">
      <span>😕 No slots available for this date</span>
    </div>

    <div v-else class="slot-picker__groups">
      <div v-for="group in groups" :key="group.label" class="slot-picker__group">
        <h4 class="slot-picker__group-label">{{ group.label }}</h4>
        <div class="slot-picker__grid">
          <button
            v-for="slot in group.slots"
            :key="slot.id"
            :class="[
              'slot-chip',
              { 'slot-chip--selected': modelValue?.id === slot.id },
              { 'slot-chip--disabled': !slot.available },
            ]"
            :disabled="!slot.available"
            :title="!slot.available ? 'Already booked' : undefined"
            @click="selectSlot(slot)"
          >
            <span class="slot-chip__time">{{ formatTime(slot.startTime) }}</span>
            <span class="slot-chip__price">
              ৳{{ slot.effectivePrice }}
              <span v-if="slot.pricingRule" class="slot-chip__rule-dot" title="Dynamic price" />
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Selected slot summary -->
    <Transition name="fade">
      <div v-if="modelValue" class="slot-picker__selected">
        <div class="slot-picker__selected-info">
          <span class="font-semibold text-slate-800">{{ modelValue.name }}</span>
          <span class="text-slate-500 text-sm">
            {{ formatTime(modelValue.startTime) }} – {{ formatTime(modelValue.endTime) }}
          </span>
        </div>
        <span class="slot-picker__selected-price">৳{{ modelValue.effectivePrice }}</span>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.slot-picker {
  &__loading,
  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 2.5rem;
    color: $color-muted;
    font-size: 0.9375rem;
    background: $color-surface;
    border-radius: $radius-btn;
    border: 1.5px dashed $color-border;
  }

  &__groups {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  &__group-label {
    font-size: 0.8125rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $color-muted;
    margin-bottom: 0.75rem;
  }

  &__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.625rem;
  }

  &__selected {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1.25rem;
    padding: 1rem 1.25rem;
    background: $color-primary-light;
    border-radius: $radius-btn;
    border: 1.5px solid $color-primary;
  }

  &__selected-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  &__selected-price {
    font-size: 1.25rem;
    font-weight: 800;
    color: $color-primary;
  }
}

.slot-chip__rule-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: $color-accent;
  margin-left: 2px;
  vertical-align: middle;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
