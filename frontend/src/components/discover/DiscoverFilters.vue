<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { categoryApi, venueFeatureApi } from '@/services/api'

const props = defineProps<{
  priceFloor: number
  priceCeiling: number
}>()

const emit = defineEmits<{
  change: [filters: {
    categoryId: string
    date: string
    timeFrom: string
    timeTo: string
    priceMax: number | null
    featureIds: string[]
    minRating: number
  }]
}>()

// ─── Categories (venue types) ─────────────────────────────────────────────────
const categories = ref<{ _id: string; title: string }[]>([])
const selectedCategoryId = ref('')

// ─── Venue Features (amenities) ───────────────────────────────────────────────
const features = ref<{ _id: string; name: string; icon: string }[]>([])
const selectedFeatureIds = ref<string[]>([])

// ─── Price ────────────────────────────────────────────────────────────────────
const priceMax = ref(0)
watch(() => props.priceCeiling, val => {
  // Reset slider when bounds change (initial load)
  if (priceMax.value === 0 || priceMax.value > val) priceMax.value = val
}, { immediate: true })

// ─── Date & Time ─────────────────────────────────────────────────────────────
const selectedDate = ref('')
const timeSlots = [
  '6 AM - 8 AM',   '8 AM - 10 AM',
  '10 AM - 12 PM', '12 PM - 2 PM',
  '2 PM - 4 PM',   '4 PM - 6 PM',
  '6 PM - 8 PM',   '8 PM - 10 PM',
]
const selectedSlot = ref('')

// ─── Rating ───────────────────────────────────────────────────────────────────
const minRating = ref(0)

// ─── Fetch ────────────────────────────────────────────────────────────────────
onMounted(async () => {
  const [catRes, featRes] = await Promise.all([
    categoryApi.list(),
    venueFeatureApi.list(),
  ])
  categories.value = catRes.data ?? []
  features.value = featRes.data ?? []
})

// ─── Emit ─────────────────────────────────────────────────────────────────────
function parseSlotTime(slot: string): { timeFrom: string; timeTo: string } {
  if (!slot) return { timeFrom: '', timeTo: '' }
  const [fromStr, toStr] = slot.split(' - ')
  function toHHMM(s: string): string {
    const m = s.trim().match(/^(\d+)\s*(AM|PM)$/i)
    if (!m) return ''
    let h = parseInt(m[1])
    if (m[2].toUpperCase() === 'PM' && h !== 12) h += 12
    else if (m[2].toUpperCase() === 'AM' && h === 12) h = 0
    return h.toString().padStart(2, '0') + ':00'
  }
  return { timeFrom: toHHMM(fromStr), timeTo: toHHMM(toStr) }
}

function emitFilters() {
  const { timeFrom, timeTo } = parseSlotTime(selectedSlot.value)
  emit('change', {
    categoryId: selectedCategoryId.value,
    date: selectedDate.value,
    timeFrom,
    timeTo,
    priceMax: priceMax.value < props.priceCeiling ? priceMax.value : null,
    featureIds: [...selectedFeatureIds.value],
    minRating: minRating.value,
  })
}

watch([selectedCategoryId, selectedDate, selectedSlot, priceMax, minRating], emitFilters)
watch(selectedFeatureIds, emitFilters, { deep: true })

// ─── Toggles ──────────────────────────────────────────────────────────────────
function toggleCategory(id: string) {
  selectedCategoryId.value = selectedCategoryId.value === id ? '' : id
}

function toggleSlot(slot: string) {
  selectedSlot.value = selectedSlot.value === slot ? '' : slot
}

function toggleFeature(id: string) {
  const i = selectedFeatureIds.value.indexOf(id)
  if (i === -1) selectedFeatureIds.value.push(id)
  else selectedFeatureIds.value.splice(i, 1)
}

function setRating(star: number) {
  minRating.value = minRating.value === star ? 0 : star
}
</script>

<template>
  <aside class="w-64 flex-shrink-0 space-y-6">
    <h2 class="font-black text-gray-900 text-lg">Filters</h2>

    <!-- Venue Type — dynamic from DB categories -->
    <div>
      <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Venue Type</p>
      <div v-if="categories.length" class="flex flex-wrap gap-2">
        <button
          v-for="cat in categories"
          :key="cat._id"
          @click="toggleCategory(cat._id)"
          :class="[
            'px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all',
            selectedCategoryId === cat._id
              ? 'bg-blue-700 text-white border-blue-700'
              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
          ]"
        >
          {{ cat.title }}
        </button>
      </div>
      <div v-else class="flex flex-wrap gap-2">
        <div v-for="i in 4" :key="i" class="h-8 w-20 bg-gray-100 animate-pulse rounded-full" />
      </div>
    </div>

    <!-- Select Date -->
    <div>
      <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Select Date</p>
      <input
        v-model="selectedDate"
        type="date"
        class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors"
      />
    </div>

    <!-- Time Slot -->
    <div>
      <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Time Slot</p>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="slot in timeSlots"
          :key="slot"
          @click="toggleSlot(slot)"
          :class="[
            'px-2 py-2 rounded-lg text-xs font-semibold border text-center transition-all leading-tight',
            selectedSlot === slot
              ? 'bg-blue-700 text-white border-blue-700'
              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
          ]"
        >
          {{ slot }}
        </button>
      </div>
    </div>

    <!-- Price Range — bounds from actual venue prices -->
    <div v-if="priceCeiling > 0">
      <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Price Range</p>
      <input
        v-model.number="priceMax"
        type="range"
        :min="priceFloor"
        :max="priceCeiling"
        class="w-full accent-blue-700"
      />
      <div class="flex justify-between text-xs text-gray-500 mt-1 font-medium">
        <span>৳{{ priceFloor }}/slot</span>
        <span>৳{{ priceMax }}/slot</span>
      </div>
    </div>

    <!-- Amenities — dynamic from DB venue features -->
    <div>
      <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Amenities</p>
      <div v-if="features.length" class="space-y-2.5">
        <label
          v-for="feature in features"
          :key="feature._id"
          class="flex items-center gap-2.5 cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="selectedFeatureIds.includes(feature._id)"
            @change="toggleFeature(feature._id)"
            class="w-4 h-4 accent-blue-700 rounded"
          />
          <span class="text-sm text-gray-700">
            <span v-if="feature.icon" class="mr-1">{{ feature.icon }}</span>{{ feature.name }}
          </span>
        </label>
      </div>
      <div v-else class="space-y-2.5">
        <div v-for="i in 4" :key="i" class="h-5 bg-gray-100 animate-pulse rounded w-3/4" />
      </div>
    </div>

    <!-- Minimum Rating -->
    <div>
      <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Minimum Rating</p>
      <div class="flex items-center gap-1">
        <button
          v-for="star in 5"
          :key="star"
          @click="setRating(star)"
          class="transition-transform hover:scale-110"
        >
          <svg class="w-5 h-5" :class="star <= minRating ? 'text-orange-500' : 'text-gray-200'" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
        <span class="text-sm text-gray-500 ml-1">{{ minRating > 0 ? '& up' : 'Any' }}</span>
      </div>
    </div>

    <!-- Elite Membership card -->
    <div class="rounded-2xl overflow-hidden" style="background: linear-gradient(145deg, #0d1b2a, #1a2a3a);">
      <div class="p-5">
        <p class="text-orange-400 text-xs font-black uppercase tracking-widest mb-2">Elite Membership</p>
        <h3 class="text-white font-black text-lg leading-tight mb-3">Go Pro & Save 25% on Bookings</h3>
        <button class="w-full bg-lime-400 hover:bg-lime-300 text-gray-900 font-black text-sm py-2.5 rounded-xl transition-colors uppercase tracking-wide">
          Learn More
        </button>
      </div>
      <div class="h-28 relative overflow-hidden" style="background: linear-gradient(to top, #0d1b2a, #1e3a5f);">
        <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-24 rounded-t-full opacity-40"
          style="background: radial-gradient(circle at 50% 80%, #2563eb, transparent);"></div>
      </div>
    </div>
  </aside>
</template>
