<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const auth = useAuthStore()

const isActive = (path: string) =>
  path === '/agent' ? route.path === '/agent' : route.path.startsWith(path)

// agentOnly: true means the item is hidden for managers (only agents see it)
const allNavItems = [
  { label: 'Dashboard',         icon: 'dashboard',  path: '/agent' },
  { label: 'My Venues',         icon: 'venues',     path: '/agent/venues' },
  { label: 'Bookings',          icon: 'bookings',   path: '/agent/bookings' },
  { label: 'Booking Calendar',  icon: 'calendar',   path: '/agent/calendar',  agentOnly: true },
  { label: 'Customers',         icon: 'customers',  path: '/agent/customers', agentOnly: true },
  { label: 'Staff & Roles',     icon: 'staff',      path: '/agent/staff',     agentOnly: true },
  { label: 'Pricing & Slots',   icon: 'slots',      path: '/agent/slots',     agentOnly: true },
  { label: 'Revenue & Reports', icon: 'reports',    path: '/agent/reports',   agentOnly: true },
  { label: 'Wallet / Payouts',  icon: 'wallet',     path: '/agent/wallet',    agentOnly: true },
  { label: 'Reviews & Ratings', icon: 'reviews',    path: '/agent/reviews',   agentOnly: true },
  { label: 'Settings',          icon: 'settings',   path: '/agent/settings',  agentOnly: true },
]

const navItems = computed(() =>
  auth.isManager
    ? allNavItems.filter((item) => !item.agentOnly)
    : allNavItems,
)
</script>

<template>
  <aside class="w-[200px] flex-shrink-0 bg-[#f5f5f0] flex flex-col min-h-screen border-r border-gray-200/60">
    <!-- Brand -->
    <div class="px-5 pt-5 pb-4">
      <p class="text-indigo-600 font-extrabold text-lg leading-none">VenueFlow</p>
      <p class="text-gray-400 text-xs mt-0.5">Agent Portal</p>
    </div>

    <!-- Nav -->
    <nav class="flex-1 px-3 py-2 space-y-0.5">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline group"
        :class="isActive(item.path)
          ? 'bg-white text-indigo-700 shadow-sm font-bold border-l-4 border-indigo-600'
          : 'text-gray-500 hover:bg-white/60 hover:text-gray-800'"
      >
        <!-- Dashboard -->
        <svg v-if="item.icon === 'dashboard'" class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
        <!-- Venues -->
        <svg v-else-if="item.icon === 'venues'" class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        <!-- Calendar -->
        <svg v-else-if="item.icon === 'calendar'" class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        <!-- Bookings -->
        <svg v-else-if="item.icon === 'bookings'" class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        <!-- Customers -->
        <svg v-else-if="item.icon === 'customers'" class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
        <!-- Staff -->
        <svg v-else-if="item.icon === 'staff'" class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
        <!-- Slots -->
        <svg v-else-if="item.icon === 'slots'" class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/></svg>
        <!-- Reports -->
        <svg v-else-if="item.icon === 'reports'" class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
        <!-- Wallet -->
        <svg v-else-if="item.icon === 'wallet'" class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
        <!-- Reviews -->
        <svg v-else-if="item.icon === 'reviews'" class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
        <!-- Settings -->
        <svg v-else-if="item.icon === 'settings'" class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>

        {{ item.label }}
      </RouterLink>
    </nav>

    <!-- User profile at bottom -->
    <div class="px-4 py-4 border-t border-gray-200/60">
      <div class="flex items-center gap-2.5">
        <img
          :src="auth.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user?.name || 'A')}&background=4f46e5&color=fff&bold=true&size=60`"
          class="w-8 h-8 rounded-full object-cover flex-shrink-0"
          :alt="auth.user?.name"
        />
        <div class="min-w-0">
          <p class="text-xs font-bold text-gray-900 truncate">{{ auth.user?.name || auth.user?.email || 'Agent' }}</p>
          <p class="text-[10px] text-gray-400 capitalize">{{ auth.isManager ? 'Manager' : 'Agent' }}</p>
        </div>
      </div>
    </div>
  </aside>
</template>
