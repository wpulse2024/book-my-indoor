import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: (_to, _from, savedPosition) => savedPosition ?? { top: 0 },
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue'),
    },
    {
      path: '/discover',
      name: 'discover',
      component: () => import('@/pages/DiscoverPage.vue'),
    },
    {
      path: '/venue/:slug',
      name: 'venue-detail',
      component: () => import('@/pages/VenueDetailPage.vue'),
    },
    {
      path: '/my-bookings',
      name: 'my-bookings',
      component: () => import('@/pages/MyBookingsPage.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Wait for session to be restored from localStorage before making decisions
  if (!auth.isInitialized) {
    await auth.fetchMe()
  }

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.guestOnly && auth.isLoggedIn) {
    return { name: 'home' }
  }

  return true
})

export default router
