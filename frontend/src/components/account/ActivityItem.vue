<script setup lang="ts">
defineProps<{
  type: 'payment' | 'review' | 'wallet'
  title: string
  subtitle: string
  amount: string
  amountColor: string
  link?: string
  linkLabel?: string
}>()

const iconConfig = {
  payment: { bg: 'bg-blue-50',   icon: 'receipt' },
  review:  { bg: 'bg-amber-50',  icon: 'star' },
  wallet:  { bg: 'bg-orange-50', icon: 'wallet' },
}
</script>

<template>
  <div class="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0">
    <!-- Icon -->
    <div :class="['w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', iconConfig[type].bg]">
      <!-- Receipt -->
      <svg v-if="type === 'payment'" class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      <!-- Star -->
      <svg v-else-if="type === 'review'" class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      <!-- Wallet -->
      <svg v-else class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
      </svg>
    </div>

    <!-- Text -->
    <div class="flex-1 min-w-0">
      <p class="text-gray-900 text-sm font-semibold">{{ title }}</p>
      <p class="text-gray-400 text-xs mt-0.5">
        {{ subtitle }}
        <a v-if="link" :href="link" class="text-blue-600 underline ml-1">{{ linkLabel }}</a>
      </p>
    </div>

    <!-- Amount -->
    <p :class="['font-black text-sm flex-shrink-0', amountColor]">{{ amount }}</p>
  </div>
</template>
