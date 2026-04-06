<script setup lang="ts">
defineProps<{
  venueName: string
  branch: string
  date: string
  time: string
  status: 'confirmed' | 'paid' | 'cancelled'
  image: string
}>()

const statusConfig = {
  confirmed: { label: 'Confirmed', dot: 'bg-green-400', text: 'text-white', bg: 'bg-green-500' },
  paid:      { label: 'Paid',      dot: 'bg-blue-300',  text: 'text-white', bg: 'bg-blue-600' },
  cancelled: { label: 'Cancelled', dot: 'bg-red-400',   text: 'text-white', bg: 'bg-red-500' },
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
    <!-- Image -->
    <div class="relative overflow-hidden" style="height: 180px;">
      <img :src="image" :alt="venueName" class="w-full h-full object-cover" />
      <!-- Status badge -->
      <span
        :class="['absolute top-3 left-3 flex items-center gap-1.5 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wide', statusConfig[status].bg]"
      >
        <span :class="['w-1.5 h-1.5 rounded-full', statusConfig[status].dot, status === 'confirmed' ? 'animate-pulse' : '']"></span>
        {{ statusConfig[status].label }}
      </span>
    </div>

    <!-- Info -->
    <div class="p-4">
      <div class="flex items-start justify-between gap-2 mb-1">
        <div>
          <h3 class="font-black text-gray-900 text-sm">{{ venueName }}</h3>
          <p class="text-gray-400 text-xs mt-0.5">{{ branch }}</p>
        </div>
        <div class="text-right flex-shrink-0">
          <p class="text-blue-700 font-black text-xs">{{ date }}</p>
          <p class="text-gray-400 text-xs mt-0.5">{{ time }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2 mt-4">
        <button class="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold text-xs py-2.5 rounded-xl hover:border-blue-300 hover:text-blue-700 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 3.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z"/>
          </svg>
          View QR Code
        </button>
        <button class="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors flex-shrink-0">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
