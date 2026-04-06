<script setup lang="ts">
defineProps<{ size?: 'sm' | 'md' | 'lg' }>()
</script>

<template>
  <span
    class="spinner"
    :class="{
      'w-4 h-4 border-2': size === 'sm',
      'w-6 h-6': !size || size === 'md',
      'w-10 h-10 border-4': size === 'lg',
    }"
    role="status"
    aria-label="Loading"
  />
</template>
