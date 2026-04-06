<script setup lang="ts">
defineProps<{
  title: string
  description: string
  iconBg: string
}>()
</script>

<template>
  <div class="flex flex-col items-center text-center">
    <div :class="['w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg', iconBg]">
      <slot name="icon" />
    </div>
    <h3 class="font-black text-gray-900 uppercase text-sm tracking-widest mb-3">{{ title }}</h3>
    <p class="text-gray-500 text-sm leading-relaxed max-w-xs">{{ description }}</p>
  </div>
</template>
