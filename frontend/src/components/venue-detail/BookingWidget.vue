<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import BookingModal from '@/components/BookingModal.vue'
import { assetUrl } from '@/services/api'
import http from '@/services/api'

const props = defineProps<{
  venue: any
  lowestPrice: number
}>()

const showModal = ref(false)

const today = new Date().toISOString().split('T')[0]
const selectedDate = ref(today)

// Slot availability fetched per date
const slotsWithStatus = ref<any[]>([])
const loadingSlots = ref(false)

async function fetchSlotAvailability(date: string) {
  if (!props.venue?._id) return
  loadingSlots.value = true
  try {
    const res = await http.get<any[]>('/bookings/slot-availability', {
      params: { venueId: props.venue._id, date },
    })
    slotsWithStatus.value = res.data
  } catch {
    // Fall back to static slots without availability info
    slotsWithStatus.value = (props.venue?.slots ?? []).map((s: any) => ({
      ...s,
      bookingStatus: null,
      isBooked: false,
    }))
  } finally {
    loadingSlots.value = false
  }
}

onMounted(() => fetchSlotAvailability(selectedDate.value))
watch(selectedDate, (date) => {
  selectedSlotId.value = ''
  fetchSlotAvailability(date)
})

const availableSlots = computed(() => slotsWithStatus.value.filter((s: any) => !s.isBooked))

const selectedSlotId = ref<string>('')

const selectedSlot = computed(() =>
  slotsWithStatus.value.find((s: any) => s._id === selectedSlotId.value) ??
  availableSlots.value[0] ??
  null
)

function selectSlot(slot: any) {
  if (slot.isBooked) return
  selectedSlotId.value = slot._id
}

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
  if (availableSlots.value.length && selectedSlot.value && !selectedSlot.value.isBooked) {
    showModal.value = true
  }
}

const modalVenue = computed(() => ({
  id: props.venue?._id ?? '',
  name: props.venue?.title ?? '',
  image: assetUrl(props.venue?.images?.[0]) || 'https://picsum.photos/seed/venue/800/500',
}))

function isSelected(slot: any): boolean {
  if (slot.isBooked) return false
  return selectedSlotId.value
    ? selectedSlotId.value === slot._id
    : slot._id === availableSlots.value[0]?._id
}
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

      <!-- Slots -->
      <div v-if="loadingSlots" class="text-center py-4 text-gray-400 text-sm animate-pulse">
        Loading slots…
      </div>

      <div v-else-if="slotsWithStatus.length">
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs font-black text-gray-400 uppercase tracking-widest">Available Slots</p>
          <span class="text-blue-700 text-xs font-black">{{ availableSlots.length }} / {{ slotsWithStatus.length }} slots</span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="slot in slotsWithStatus"
            :key="slot._id"
            @click="selectSlot(slot)"
            :disabled="slot.isBooked"
            :class="[
              'rounded-xl py-2.5 px-2 text-center transition-all text-xs font-bold leading-tight relative',
              slot.isBooked
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200'
                : isSelected(slot)
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'border border-gray-200 text-gray-700 hover:border-blue-400'
            ]"
          >
            <p>{{ formatTime(slot.startTime) }}</p>
            <p :class="[
              'text-[11px] mt-0.5',
              slot.isBooked
                ? 'text-gray-300'
                : isSelected(slot) ? 'text-blue-200' : 'text-gray-500'
            ]">
              {{ slot.isBooked ? (slot.bookingStatus === 'pending' ? 'Pending' : 'Booked') : '৳' + Number(slot.price).toLocaleString() }}
            </p>
          </button>
        </div>
      </div>

      <!-- No slots -->
      <div v-else class="text-center py-4 text-gray-400 text-sm">
        No slots available yet.
      </div>

      <!-- Price breakdown -->
      <div v-if="selectedSlot && !selectedSlot.isBooked" class="border-t border-gray-100 pt-4 space-y-2">
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
        :disabled="!availableSlots.length || !selectedSlot"
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
    v-if="showModal && selectedSlot && !selectedSlot.isBooked"
    :venue="modalVenue"
    :slot-id="selectedSlot._id"
    :booking-date="selectedDate"
    :slot="{ startTime: selectedSlot.startTime, endTime: selectedSlot.endTime, price: Number(selectedSlot.price) }"
    @close="showModal = false"
  />
</template>
