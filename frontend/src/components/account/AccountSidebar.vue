<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

async function logout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="w-64 flex-shrink-0">
    <!-- User info -->
    <div class="mb-8">
      <p class="text-blue-700 font-black text-base">{{ auth.user?.name || 'My Account' }}</p>
      <p class="text-gray-400 text-sm">
        Member since {{ auth.user?.createdAt ? new Date(auth.user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—' }}
      </p>
    </div>

    <!-- Nav -->
    <nav class="space-y-1 mb-8">
      <RouterLink
        to="/account/profile"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors no-underline"
        :class="route.name === 'account-profile' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'"
      >
        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
        Profile Settings
      </RouterLink>
    </nav>

    <!-- Divider + Log Out -->
    <div class="border-t border-gray-100 pt-4">
      <button
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors w-full text-left"
        @click="logout"
      >
        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
        Log Out
      </button>
    </div>
  </aside>
</template>
