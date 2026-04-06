<script setup lang="ts">
defineProps<{
  address: string
}>()
</script>

<template>
  <div>
    <h3 class="font-black text-gray-900 text-sm uppercase tracking-widest mb-4">Location</h3>
    <div
      class="relative w-full rounded-2xl overflow-hidden border border-gray-100"
      style="height: 260px; background: #e8edf2;"
    >
      <!-- Fake map grid lines -->
      <svg class="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
        <!-- Roads -->
        <line x1="0" y1="80" x2="400" y2="80" stroke="#c5cdd6" stroke-width="2"/>
        <line x1="0" y1="140" x2="400" y2="140" stroke="#c5cdd6" stroke-width="2"/>
        <line x1="0" y1="200" x2="400" y2="200" stroke="#c5cdd6" stroke-width="2"/>
        <line x1="80" y1="0" x2="80" y2="260" stroke="#c5cdd6" stroke-width="2"/>
        <line x1="160" y1="0" x2="160" y2="260" stroke="#c5cdd6" stroke-width="2"/>
        <line x1="240" y1="0" x2="240" y2="260" stroke="#c5cdd6" stroke-width="2"/>
        <line x1="320" y1="0" x2="320" y2="260" stroke="#c5cdd6" stroke-width="2"/>
        <!-- Diagonal road -->
        <line x1="0" y1="260" x2="240" y2="60" stroke="#c5cdd6" stroke-width="2.5"/>
        <line x1="160" y1="260" x2="400" y2="60" stroke="#c5cdd6" stroke-width="1.5"/>
        <!-- Blocks -->
        <rect x="90" y="90" width="60" height="40" fill="#d8e1ea" rx="4"/>
        <rect x="170" y="90" width="60" height="40" fill="#d8e1ea" rx="4"/>
        <rect x="90" y="150" width="60" height="40" fill="#d8e1ea" rx="4"/>
        <rect x="250" y="150" width="60" height="40" fill="#d8e1ea" rx="4"/>
        <rect x="250" y="90" width="60" height="40" fill="#d8e1ea" rx="4"/>
      </svg>

      <!-- Pin -->
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
        <div class="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <div class="w-2 h-2 bg-blue-700 rounded-full mx-auto mt-0.5 opacity-30"></div>
      </div>

      <!-- Address label -->
      <div class="absolute bottom-3 left-3 bg-white rounded-xl px-3 py-2 shadow text-xs font-semibold text-gray-700">
        {{ address }}
      </div>
    </div>
  </div>
</template>
