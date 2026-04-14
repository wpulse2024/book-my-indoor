<script setup lang="ts">
import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useWishlistStore } from '@/stores/wishlist.store'
import ToastNotifications from '@/components/common/ToastNotifications.vue'

const authStore    = useAuthStore()
const wishlistStore = useWishlistStore()

// Fetch wishlist once auth is resolved — keeps all heart buttons in sync globally
watch(
  () => authStore.isInitialized,
  (ready) => {
    if (ready && authStore.isLoggedIn) {
      wishlistStore.fetch()
    }
  },
  { immediate: true },
)

// Also fetch when the user logs in mid-session (e.g. from LoginPage)
watch(
  () => authStore.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) {
      wishlistStore.fetch()
    } else {
      wishlistStore.reset()
    }
  },
)
</script>

<template>
  <RouterView />
  <ToastNotifications />
</template>
