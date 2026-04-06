<script setup lang="ts">
defineProps<{
  variant?: 'green' | 'orange' | 'blue' | 'gray' | 'red'
}>()
</script>

<template>
  <span :class="`badge badge--${variant ?? 'gray'}`">
    <slot />
  </span>
</template>
