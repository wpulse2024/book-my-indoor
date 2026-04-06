<script setup lang="ts">
defineProps<{
  amenities: { icon: string; label: string }[]
}>()
</script>

<template>
  <div class="border border-gray-100 rounded-2xl p-6">
    <h3 class="font-black text-gray-900 text-sm uppercase tracking-widest mb-5">Elite Amenities</h3>
    <div class="grid grid-cols-4 gap-4">
      <div v-for="amenity in amenities" :key="amenity.label" class="flex flex-col items-center gap-2 text-center">
        <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
          <span class="text-2xl">{{ amenity.icon }}</span>
        </div>
        <span class="text-xs font-semibold text-gray-600">{{ amenity.label }}</span>
      </div>
    </div>
  </div>
</template>
