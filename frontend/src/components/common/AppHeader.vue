<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useBookingStore } from '@/stores/booking.store'
import AuthModal from '@/components/common/AuthModal.vue'

const auth = useAuthStore()
const bookingStore = useBookingStore()
const router = useRouter()
const mobileOpen = ref(false)
const showAuth = ref(false)

const navLinks = [
  { name: 'Find Venues', to: '/venues' },
  { name: 'How it works', to: '/#how-it-works' },
]

const walletBalance = computed(() =>
  auth.isLoggedIn ? bookingStore.walletBalance : 0,
)

function openAuth() {
  showAuth.value = true
  mobileOpen.value = false
}

async function handleLogout() {
  await auth.logout()
  router.push('/')
}

// Fetch wallet balance when logged in
if (auth.isLoggedIn) bookingStore.fetchWallet()
</script>

<template>
  <header class="header">
    <div class="container header__inner">
      <!-- Logo -->
      <RouterLink to="/" class="header__logo">
        <span class="header__logo-icon">⚽</span>
        <span class="header__logo-text">BookMyIndoor</span>
      </RouterLink>

      <!-- Desktop nav -->
      <nav class="header__nav">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="header__nav-link"
          active-class="header__nav-link--active"
        >
          {{ link.name }}
        </RouterLink>
      </nav>

      <!-- Desktop actions -->
      <div class="header__actions">
        <template v-if="auth.isLoggedIn">
          <RouterLink to="/wallet" class="header__wallet">
            <span class="header__wallet-icon">💰</span>
            <span class="header__wallet-amount">৳{{ walletBalance.toFixed(0) }}</span>
          </RouterLink>
          <div class="header__user-menu">
            <RouterLink to="/bookings" class="header__nav-link">My Bookings</RouterLink>
            <RouterLink to="/profile" class="header__avatar">
              <span>{{ auth.user?.name.charAt(0).toUpperCase() }}</span>
            </RouterLink>
            <button class="btn btn--ghost btn--sm" @click="handleLogout">Logout</button>
          </div>
        </template>
        <template v-else>
          <button class="btn btn--outline btn--sm" @click="openAuth">Sign In</button>
          <button class="btn btn--primary btn--sm" @click="openAuth">Book Now</button>
        </template>
      </div>

      <!-- Mobile hamburger -->
      <button class="header__hamburger" :aria-expanded="mobileOpen" @click="mobileOpen = !mobileOpen">
        <span />
        <span />
        <span />
      </button>
    </div>

    <!-- Mobile drawer -->
    <Transition name="slide-down">
      <div v-if="mobileOpen" class="header__mobile">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="header__mobile-link"
          @click="mobileOpen = false"
        >
          {{ link.name }}
        </RouterLink>
        <template v-if="auth.isLoggedIn">
          <RouterLink to="/bookings" class="header__mobile-link" @click="mobileOpen = false">My Bookings</RouterLink>
          <RouterLink to="/wallet" class="header__mobile-link" @click="mobileOpen = false">Wallet · ৳{{ walletBalance.toFixed(0) }}</RouterLink>
          <RouterLink to="/profile" class="header__mobile-link" @click="mobileOpen = false">Profile</RouterLink>
          <button class="btn btn--ghost btn--full mt-2" @click="handleLogout">Logout</button>
        </template>
        <template v-else>
          <button class="btn btn--primary btn--full mt-2" @click="openAuth">Sign In / Register</button>
        </template>
      </div>
    </Transition>
  </header>

  <AuthModal v-if="showAuth" @close="showAuth = false" />
</template>

<style lang="scss" scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgb(255 255 255 / 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid $color-border;

  &__inner {
    display: flex;
    align-items: center;
    gap: 2rem;
    height: 4rem;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    flex-shrink: 0;

    &-icon { font-size: 1.5rem; }
    &-text {
      font-size: 1.125rem;
      font-weight: 800;
      color: $color-primary;
      letter-spacing: -0.02em;
    }
  }

  &__nav {
    display: none;
    align-items: center;
    gap: 0.25rem;
    flex: 1;

    @media (min-width: $bp-md) { display: flex; }
  }

  &__nav-link {
    padding: 0.375rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.9375rem;
    font-weight: 500;
    color: $color-dark-soft;
    text-decoration: none;
    transition: all $transition-base;

    &:hover, &--active { color: $color-primary; background: $color-primary-light; }
  }

  &__actions {
    display: none;
    align-items: center;
    gap: 0.75rem;
    margin-left: auto;

    @media (min-width: $bp-md) { display: flex; }
  }

  &__user-menu {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__wallet {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    background: $color-primary-light;
    border-radius: 99px;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 600;
    color: $color-primary-dark;
    transition: background $transition-base;
    &:hover { background: #bbf7d0; }

    &-icon { font-size: 1rem; }
  }

  &__avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: $color-primary;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 700;
    text-decoration: none;
    flex-shrink: 0;
  }

  &__hamburger {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    width: 2rem;
    height: 2rem;
    background: none;
    border: none;
    cursor: pointer;
    margin-left: auto;
    padding: 4px;

    @media (min-width: $bp-md) { display: none; }

    span {
      display: block;
      width: 100%;
      height: 2px;
      background: $color-dark;
      border-radius: 2px;
      transition: all $transition-base;
    }
  }

  &__mobile {
    display: flex;
    flex-direction: column;
    padding: 1rem 1.25rem 1.5rem;
    border-top: 1px solid $color-border;
    background: $color-white;
    gap: 0.25rem;

    @media (min-width: $bp-md) { display: none; }
  }

  &__mobile-link {
    padding: 0.75rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
    color: $color-dark-soft;
    text-decoration: none;
    transition: all $transition-base;
    &:hover { background: $color-surface; color: $color-primary; }
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 400px;
  opacity: 1;
}
</style>
