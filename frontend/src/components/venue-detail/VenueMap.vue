<script setup lang="ts">
defineProps<{
  lat: number
  lng: number
  address?: string
}>()
</script>

<template>
  <div>
    <h3 class="font-black text-gray-900 text-sm uppercase tracking-widest mb-4">Location</h3>
    <div class="relative w-full rounded-2xl overflow-hidden border border-gray-100" style="height: 260px;">
      <iframe
        :src="`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`"
        width="100%"
        height="100%"
        style="border: 0;"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        class="w-full h-full"
      />
    </div>
    <p v-if="address" class="mt-2 text-xs text-gray-500 flex items-center gap-1">
      <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
      {{ address }}
    </p>
  </div>
</template>
