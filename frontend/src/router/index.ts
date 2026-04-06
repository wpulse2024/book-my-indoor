import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: (_to, _from, savedPosition) =>
    savedPosition ?? { top: 0, behavior: 'smooth' },
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/UserLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/pages/HomePage.vue'),
        },
        {
          path: 'venues',
          name: 'venues',
          component: () => import('@/pages/VenuesPage.vue'),
        },
        {
          path: 'venues/:slug',
          name: 'venue-detail',
          component: () => import('@/pages/VenueDetailPage.vue'),
          props: true,
        },
        {
          path: 'book/:slotId',
          name: 'booking',
          component: () => import('@/pages/BookingPage.vue'),
          meta: { requiresAuth: true },
          props: true,
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/pages/ProfilePage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'bookings',
          name: 'bookings',
          component: () => import('@/pages/BookingHistoryPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'wallet',
          name: 'wallet',
          component: () => import('@/pages/WalletPage.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFoundPage.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'home', query: { login: '1', redirect: to.fullPath } }
  }
})

export default router
