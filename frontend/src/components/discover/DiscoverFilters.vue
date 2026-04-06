<script setup lang="ts">
import { ref } from 'vue'

const venueTypes = ['Basketball', 'Badminton', 'Tennis', 'Futsal']
const selectedTypes = ref<string[]>(['Basketball'])

const priceMin = ref(20)
const priceMax = ref(120)

const amenities = [
  { key: 'ac', label: 'Air Conditioning' },
  { key: 'changing', label: 'Changing Rooms' },
  { key: 'parking', label: 'Free Parking' },
  { key: 'shower', label: 'Shower Facilities' },
]
const selectedAmenities = ref<string[]>(['changing', 'shower'])

const minRating = ref(4)
const selectedDate = ref('2023-10-27')

const timeSlots = [
  '12 AM - 1 AM', '1 AM - 2 AM',
  '2 AM - 3 AM', '3 AM - 4 AM',
  '4 AM - 5 AM', '5 AM - 6 AM',
  '6 AM - 7 AM', '7 AM - 8 AM',
]
const selectedSlot = ref('12 AM - 1 AM')

function toggleType(type: string) {
  const i = selectedTypes.value.indexOf(type)
  if (i === -1) selectedTypes.value.push(type)
  else selectedTypes.value.splice(i, 1)
}

function toggleAmenity(key: string) {
  const i = selectedAmenities.value.indexOf(key)
  if (i === -1) selectedAmenities.value.push(key)
  else selectedAmenities.value.splice(i, 1)
}
</script>

<template>
  <aside class="w-64 flex-shrink-0 space-y-6">
    <!-- Filters heading -->
    <h2 class="font-black text-gray-900 text-lg">Filters</h2>

    <!-- Venue Type -->
    <div>
      <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Venue Type</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="type in venueTypes"
          :key="type"
          @click="toggleType(type)"
          :class="[
            'px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all',
            selectedTypes.includes(type)
              ? 'bg-blue-700 text-white border-blue-700'
              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
          ]"
        >
          {{ type }}
        </button>
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
          @click="selectedSlot = slot"
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

    <!-- Price Range -->
    <div>
      <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Price Range</p>
      <input
        v-model="priceMax"
        type="range"
        min="20"
        max="500"
        class="w-full accent-blue-700"
      />
      <div class="flex justify-between text-xs text-gray-500 mt-1 font-medium">
        <span>${{ priceMin }}/hr</span>
        <span>${{ priceMax }}/hr</span>
      </div>
    </div>

    <!-- Amenities -->
    <div>
      <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Amenities</p>
      <div class="space-y-2.5">
        <label
          v-for="amenity in amenities"
          :key="amenity.key"
          class="flex items-center gap-2.5 cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="selectedAmenities.includes(amenity.key)"
            @change="toggleAmenity(amenity.key)"
            class="w-4 h-4 accent-blue-700 rounded"
          />
          <span class="text-sm text-gray-700">{{ amenity.label }}</span>
        </label>
      </div>
    </div>

    <!-- Minimum Rating -->
    <div>
      <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Minimum Rating</p>
      <div class="flex items-center gap-1">
        <button
          v-for="star in 5"
          :key="star"
          @click="minRating = star"
          class="transition-transform hover:scale-110"
        >
          <svg class="w-5 h-5" :class="star <= minRating ? 'text-orange-500' : 'text-gray-200'" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
        <span class="text-sm text-gray-500 ml-1">& up</span>
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
      <!-- Person silhouette area -->
      <div class="h-28 relative overflow-hidden" style="background: linear-gradient(to top, #0d1b2a, #1e3a5f);">
        <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-24 rounded-t-full opacity-40"
          style="background: radial-gradient(circle at 50% 80%, #2563eb, transparent);"></div>
      </div>
    </div>
  </aside>
</template>
