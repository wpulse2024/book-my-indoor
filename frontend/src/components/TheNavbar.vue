<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const isActive = (name: string) => route.name === name

// Profile dropdown
const dropdownOpen = ref(false)
const dropdownRef  = ref<HTMLElement | null>(null)

function toggleDropdown()  { dropdownOpen.value = !dropdownOpen.value }
function closeDropdown()   { dropdownOpen.value = false }

// Mobile menu
const mobileOpen = ref(false)
function closeMobile() { mobileOpen.value = false }

async function handleLogout() {
  closeDropdown()
  closeMobile()
  await auth.logout()
  router.push('/login')
}

function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    closeDropdown()
  }
}

onMounted(()          => document.addEventListener('mousedown', handleClickOutside))
onBeforeUnmount(()    => document.removeEventListener('mousedown', handleClickOutside))
</script>

<template>
  <nav class="bg-white border-b border-gray-100 sticky top-0 z-50">

    <!-- Main bar -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

      <!-- Logo + desktop nav -->
      <div class="flex items-center gap-8 lg:gap-10">
        <RouterLink to="/" class="text-blue-700 font-extrabold text-xl tracking-tight italic no-underline flex-shrink-0">
          CourtKinetic
        </RouterLink>

        <div class="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium">
          <RouterLink
            to="/"
            class="pb-0.5 transition-colors no-underline"
            :class="isActive('home') ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:text-gray-900'"
          >
            Home
          </RouterLink>
          <RouterLink
            to="/discover"
            class="pb-0.5 transition-colors no-underline"
            :class="isActive('discover') || isActive('venue-detail') ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:text-gray-900'"
          >
            Explore
          </RouterLink>
          <RouterLink
            v-if="auth.isLoggedIn"
            to="/my-bookings"
            class="pb-0.5 transition-colors no-underline"
            :class="isActive('my-bookings') ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:text-gray-900'"
          >
            My Bookings
          </RouterLink>
          <a href="#" class="text-gray-500 hover:text-gray-900 transition-colors no-underline">Help</a>
        </div>
      </div>

      <!-- Right side -->
      <div class="flex items-center gap-1">

        <!-- Location icon -->
        <button class="hidden sm:flex p-2 text-gray-400 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-50">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <!-- Bell (logged in only) -->
        <button v-if="auth.isLoggedIn" class="relative p-2 text-gray-400 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-50">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white"></span>
        </button>

        <!-- Guest: Get Started button (desktop) -->
        <RouterLink
          v-if="!auth.isLoggedIn"
          to="/login"
          class="hidden sm:inline-flex ml-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-black uppercase tracking-wide rounded-lg transition-colors no-underline shadow-sm"
        >
          Get Started
        </RouterLink>

        <!-- Logged in: Profile dropdown (desktop) -->
        <div v-if="auth.isLoggedIn" class="relative ml-1 hidden md:block" ref="dropdownRef">
          <button
            @click="toggleDropdown"
            class="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-50 transition-colors group"
          >
            <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-transparent group-hover:ring-blue-400 transition-all">
              <img
                :src="auth.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user?.name || 'U')}&background=1d4ed8&color=fff&bold=true`"
                :alt="auth.user?.name || 'Profile'"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="text-left">
              <p class="text-xs font-bold text-gray-800 leading-none">{{ auth.user?.name || 'My Account' }}</p>
              <p class="text-xs text-gray-400 leading-none mt-0.5">{{ auth.user?.phone || auth.user?.email || '' }}</p>
            </div>
            <svg
              class="w-3.5 h-3.5 text-gray-400 transition-transform"
              :class="dropdownOpen ? 'rotate-180' : ''"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Dropdown -->
          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-1"
          >
            <div
              v-if="dropdownOpen"
              class="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 origin-top-right"
            >
              <div class="px-4 py-3 border-b border-gray-100">
                <p class="text-sm font-bold text-gray-900 truncate">{{ auth.user?.name || 'My Account' }}</p>
                <p class="text-xs text-gray-400 truncate mt-0.5">{{ auth.user?.email || auth.user?.phone || '' }}</p>
              </div>
              <div class="py-1">
                <RouterLink
                  to="/my-bookings"
                  @click="closeDropdown"
                  class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-700 transition-colors no-underline"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  My Bookings
                </RouterLink>
                <RouterLink
                  to="/account/profile"
                  @click="closeDropdown"
                  class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-700 transition-colors no-underline"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </RouterLink>
              </div>
              <div class="border-t border-gray-100 py-1">
                <button
                  @click="handleLogout"
                  class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Hamburger (mobile) -->
        <button
          @click="mobileOpen = !mobileOpen"
          class="md:hidden p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors ml-1"
          aria-label="Toggle menu"
        >
          <svg v-if="!mobileOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

      </div>
    </div>

    <!-- Mobile menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="mobileOpen" class="md:hidden border-t border-gray-100 bg-white shadow-lg">
        <div class="px-4 py-3 space-y-0.5">
          <RouterLink
            to="/"
            @click="closeMobile"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold no-underline transition-colors"
            :class="isActive('home') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Home
          </RouterLink>
          <RouterLink
            to="/discover"
            @click="closeMobile"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold no-underline transition-colors"
            :class="isActive('discover') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            Explore Venues
          </RouterLink>
          <RouterLink
            v-if="auth.isLoggedIn"
            to="/my-bookings"
            @click="closeMobile"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold no-underline transition-colors"
            :class="isActive('my-bookings') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            My Bookings
          </RouterLink>
          <a
            href="#"
            @click.prevent="closeMobile"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors no-underline"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Help
          </a>
        </div>

        <!-- Mobile auth section -->
        <div class="border-t border-gray-100 px-4 py-3">
          <div v-if="auth.isLoggedIn" class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img
                :src="auth.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user?.name || 'U')}&background=1d4ed8&color=fff&bold=true`"
                :alt="auth.user?.name || 'Profile'"
                class="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <p class="text-sm font-bold text-gray-900">{{ auth.user?.name || 'My Account' }}</p>
                <p class="text-xs text-gray-400">{{ auth.user?.phone || auth.user?.email || '' }}</p>
              </div>
            </div>
            <button
              @click="handleLogout"
              class="text-xs font-bold text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
          <RouterLink
            v-else
            to="/login"
            @click="closeMobile"
            class="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white text-sm font-black uppercase tracking-wide py-2.5 rounded-xl transition-colors no-underline"
          >
            Get Started
          </RouterLink>
        </div>

      </div>
    </Transition>

  </nav>
</template>
