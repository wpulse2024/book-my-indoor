<script setup lang="ts">
import { ref, computed } from 'vue'
import BookingModal from '@/components/BookingModal.vue'

const showModal = ref(false)

const venue = {
  name: 'Titan Arena Complex',
  tier: 'Pro Tier',
  image: 'https://picsum.photos/seed/titan-main/800/500',
}

const selectedDate = ref('2023-10-24')

const slots = [
  { time: '08:00 AM', price: '$35', full: false },
  { time: '08:00 AM', price: '$45', full: false },
  { time: '10:00 AM', price: '$45', full: false },
  { time: '02:00 PM', price: 'FULL', full: true },
  { time: '06:00 PM', price: '$65', full: false },
  { time: '08:00 PM', price: '$55', full: false },
]

const selectedSlotKey = ref('08:00 AM-$35')

const sessionCost = computed(() => {
  const s = slots.find(s => `${s.time}-${s.price}` === selectedSlotKey.value)
  return s && !s.full ? parseFloat(s.price.replace('$', '')) : 35
})
const platformFee = 2.50
const total = computed(() => sessionCost.value + platformFee)

const displayDate = computed(() => {
  if (!selectedDate.value) return 'Select date'
  const d = new Date(selectedDate.value)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
})

const dayName = computed(() => {
  if (!selectedDate.value) return ''
  const d = new Date(selectedDate.value)
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow, Thursday'
  return d.toLocaleDateString('en-US', { weekday: 'long' })
})
</script>

<template>
  <div class="bg-blue-700 rounded-2xl overflow-hidden shadow-2xl sticky top-20">
    <!-- Header -->
    <div class="px-5 pt-5 pb-4">
      <div class="flex items-center justify-between mb-1">
        <p class="text-blue-200 text-xs font-bold uppercase tracking-widest">Hourly Rate Starts From</p>
        <span class="bg-green-400 text-green-900 text-xs font-black px-2 py-0.5 rounded-full uppercase tracking-wide">Live</span>
      </div>
      <div class="flex items-baseline gap-1">
        <span class="text-white font-black text-4xl leading-none">$45.00</span>
        <span class="text-blue-300 text-sm font-medium">/ hour</span>
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
          <input v-model="selectedDate" type="date" class="sr-only" />
        </label>
      </div>

      <!-- Available Slots -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs font-black text-gray-400 uppercase tracking-widest">Available Slots</p>
          <span class="text-blue-700 text-xs font-black flex items-center gap-1">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            8 Slots Left
          </span>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="slot in slots"
            :key="`${slot.time}-${slot.price}`"
            :disabled="slot.full"
            @click="!slot.full && (selectedSlotKey = `${slot.time}-${slot.price}`)"
            :class="[
              'rounded-xl py-2.5 text-center transition-all text-xs font-bold leading-tight',
              slot.full
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : selectedSlotKey === `${slot.time}-${slot.price}`
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'border border-gray-200 text-gray-700 hover:border-blue-400'
            ]"
          >
            <p>{{ slot.time }}</p>
            <p :class="slot.full ? 'text-gray-400' : selectedSlotKey === `${slot.time}-${slot.price}` ? 'text-blue-200' : 'text-gray-500'">
              {{ slot.price }}
            </p>
          </button>
        </div>
      </div>

      <!-- Price breakdown -->
      <div class="border-t border-gray-100 pt-4 space-y-2">
        <div class="flex justify-between text-sm text-gray-500">
          <span>Session: 06:00 AM – 07:00 AM</span>
          <span class="font-semibold text-gray-700">${{ sessionCost.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-sm text-gray-500">
          <span>Platform Fee</span>
          <span class="font-semibold text-gray-700">${{ platformFee.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-sm font-black text-gray-900 pt-1 border-t border-gray-100">
          <span>Total</span>
          <span class="text-blue-700">${{ total.toFixed(2) }}</span>
        </div>
      </div>

      <!-- CTA -->
      <button
        @click="showModal = true"
        class="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black text-sm py-4 rounded-xl transition-colors flex items-center justify-center gap-2 uppercase tracking-wide"
      >
        Continue to Booking
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <p class="text-center text-gray-400 text-xs">Free cancellation up to 12 hours before the start of the session.</p>
    </div>
  </div>

  <!-- Booking Modal -->
  <BookingModal
    v-if="showModal"
    :venue="venue"
    :date="displayDate"
    :time-slot="selectedSlotKey.split('-')[0]"
    :total-price="'$' + total.toFixed(2)"
    @close="showModal = false"
    @confirm="showModal = false"
  />
</template>
