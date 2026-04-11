<script setup lang="ts">
import { ref, computed } from 'vue'
import BookingModal from '@/components/BookingModal.vue'
import { assetUrl } from '@/services/api'

const props = defineProps<{
  venue: any
  lowestPrice: number
}>()

const showModal = ref(false)

const today = new Date().toISOString().split('T')[0]
const selectedDate = ref(today)

const slots = computed(() => props.venue?.slots ?? [])
const selectedSlotId = ref<string>('')

// Auto-select first slot when slots load
const selectedSlot = computed(() =>
  slots.value.find((s: any) => s._id === selectedSlotId.value) ?? slots.value[0] ?? null
)

function formatTime(t: string): string {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

const PLATFORM_FEE = 0

const sessionCost = computed(() => selectedSlot.value ? Number(selectedSlot.value.price) || 0 : 0)
const total = computed(() => sessionCost.value + PLATFORM_FEE)

const displayDate = computed(() => {
  if (!selectedDate.value) return 'Select date'
  const d = new Date(selectedDate.value)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
})

const dayName = computed(() => {
  if (!selectedDate.value) return ''
  const d = new Date(selectedDate.value + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long' })
})

const timeSlotLabel = computed(() => {
  if (!selectedSlot.value) return ''
  return `${formatTime(selectedSlot.value.startTime)} – ${formatTime(selectedSlot.value.endTime)}`
})

function openModal() {
  if (slots.value.length) showModal.value = true
}

const modalVenue = computed(() => ({
  name: props.venue?.title ?? '',
  image: assetUrl(props.venue?.images?.[0]) || 'https://picsum.photos/seed/venue/800/500',
}))
</script>

<template>
  <div class="bg-blue-700 rounded-2xl overflow-hidden shadow-2xl sticky top-20">
    <!-- Header -->
    <div class="px-5 pt-5 pb-4">
      <div class="flex items-center justify-between mb-1">
        <p class="text-blue-200 text-xs font-bold uppercase tracking-widest">Starts From</p>
        <span class="bg-green-400 text-green-900 text-xs font-black px-2 py-0.5 rounded-full uppercase tracking-wide">Live</span>
      </div>
      <div class="flex items-baseline gap-1">
        <span class="text-white font-black text-4xl leading-none">
          {{ lowestPrice > 0 ? '৳' + lowestPrice.toLocaleString() : '—' }}
        </span>
        <span class="text-blue-300 text-sm font-medium">/ slot</span>
      </div>
    </div>

    <!-- Body -->
    <div class="bg-white rounded-t-2xl px-5 py-5 space-y-5">
      <!-- Select Date -->
      <div>
        <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Select Date</p>
        <label class="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:border-blue-400 transition-colors">
          <div>
            <p class="font-black text-gray-900 text-base">{{ displayDate }}</p>
            <p class="text-gray-400 text-xs mt-0.5">{{ dayName }}</p>
          </div>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <input v-model="selectedDate" type="date" :min="today" class="sr-only" />
        </label>
      </div>

      <!-- Available Slots -->
      <div v-if="slots.length">
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs font-black text-gray-400 uppercase tracking-widest">Available Slots</p>
          <span class="text-blue-700 text-xs font-black">{{ slots.length }} slots</span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="slot in slots"
            :key="slot._id"
            @click="selectedSlotId = slot._id"
            :class="[
              'rounded-xl py-2.5 px-2 text-center transition-all text-xs font-bold leading-tight',
              selectedSlotId === slot._id || (!selectedSlotId && slot === slots[0])
                ? 'bg-blue-700 text-white shadow-md'
                : 'border border-gray-200 text-gray-700 hover:border-blue-400'
            ]"
          >
            <p>{{ formatTime(slot.startTime) }}</p>
            <p :class="[
              'text-[11px] mt-0.5',
              selectedSlotId === slot._id || (!selectedSlotId && slot === slots[0])
                ? 'text-blue-200' : 'text-gray-500'
            ]">
              ৳{{ Number(slot.price).toLocaleString() }}
            </p>
          </button>
        </div>
      </div>

      <!-- No slots -->
      <div v-else class="text-center py-4 text-gray-400 text-sm">
        No slots available yet.
      </div>

      <!-- Price breakdown -->
      <div v-if="selectedSlot" class="border-t border-gray-100 pt-4 space-y-2">
        <div class="flex justify-between text-sm text-gray-500">
          <span>{{ timeSlotLabel }}</span>
          <span class="font-semibold text-gray-700">৳{{ sessionCost.toLocaleString() }}</span>
        </div>
        <div class="flex justify-between text-sm font-black text-gray-900 pt-1 border-t border-gray-100">
          <span>Total</span>
          <span class="text-blue-700">৳{{ total.toLocaleString() }}</span>
        </div>
      </div>

      <!-- CTA -->
      <button
        @click="openModal"
        :disabled="!slots.length"
        class="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm py-4 rounded-xl transition-colors flex items-center justify-center gap-2 uppercase tracking-wide"
      >
        Continue to Booking
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <p class="text-center text-gray-400 text-xs">Free cancellation up to 12 hours before the session.</p>
    </div>
  </div>

  <!-- Booking Modal -->
  <BookingModal
    v-if="showModal"
    :venue="modalVenue"
    :date="displayDate"
    :time-slot="timeSlotLabel"
    :total-price="'৳' + total.toLocaleString()"
    @close="showModal = false"
    @confirm="showModal = false"
  />
</template>
