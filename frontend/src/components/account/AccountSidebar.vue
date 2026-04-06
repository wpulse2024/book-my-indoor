<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const isActive = (name: string) => route.name === name

const navItems = [
  { name: 'account-profile', label: 'Profile Settings', icon: 'user' },
  { name: 'account-payment', label: 'Payment Methods', icon: 'credit-card' },
  { name: 'account-bookings', label: 'Membership', icon: 'membership' },
  { name: 'account-privacy', label: 'Privacy', icon: 'shield' },
]
</script>

<template>
  <aside class="w-64 flex-shrink-0">
    <!-- User info -->
    <div class="mb-8">
      <p class="text-blue-700 font-black text-base">Pro Athlete</p>
      <p class="text-gray-400 text-sm">Elite Tier Member</p>
    </div>

    <!-- Nav -->
    <nav class="space-y-1 mb-8">
      <!-- Profile Settings -->
      <RouterLink
        to="/account/bookings"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors no-underline"
        :class="route.name === 'account-bookings' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'"
      >
        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
        Profile Settings
      </RouterLink>

      <!-- Payment Methods -->
      <RouterLink
        to="/account/payment"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors no-underline"
        :class="route.name === 'account-payment' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'"
      >
        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
        </svg>
        Payment Methods
      </RouterLink>

      <!-- Membership — active -->
      <RouterLink
        to="/account/membership"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors no-underline"
        :class="route.name === 'account-membership' || route.name === 'account-bookings' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'"
      >
        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" stroke-width="2"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4"/>
        </svg>
        Membership
      </RouterLink>

      <!-- Privacy -->
      <RouterLink
        to="/account/privacy"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors no-underline"
        :class="route.name === 'account-privacy' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'"
      >
        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
        Privacy
      </RouterLink>
    </nav>

    <!-- Divider -->
    <div class="border-t border-gray-100 pt-4 mb-6">
      <button class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors w-full text-left">
        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
        Log Out
      </button>
    </div>

    <!-- Upgrade CTA -->
    <button class="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black text-sm py-3 rounded-xl transition-colors uppercase tracking-wide">
      Upgrade to Pro
    </button>
  </aside>
</template>
