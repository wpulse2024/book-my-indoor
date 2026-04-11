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
    {
      path: '/account/profile',
      name: 'account-profile',
      component: () => import('@/pages/AccountProfilePage.vue'),
      meta: { requiresAuth: true },
    },

    // ── Agent app ──────────────────────────────────────────────────────────────
    {
      path: '/agent',
      component: () => import('@/layouts/AgentLayout.vue'),
      meta: { requiresAuth: true, requiresAgent: true },
      children: [
        { path: '', name: 'agent-dashboard', component: () => import('@/pages/agent/AgentDashboardPage.vue') },
        { path: 'venues',   name: 'agent-venues',   component: () => import('@/pages/agent/AgentVenuesPage.vue') },
        { path: 'bookings', name: 'agent-bookings', component: () => import('@/pages/agent/AgentBookingsPage.vue') },
        { path: 'staff', name: 'agent-staff', component: () => import('@/pages/agent/AgentStaffPage.vue') },
        { path: 'settings', name: 'agent-settings', component: () => import('@/pages/agent/AgentSettingsPage.vue') },
      ],
    },

    // ── Admin app ──────────────────────────────────────────────────────────────
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          redirect: { name: 'admin-venues' },
        },
        {
          path: 'venues',
          name: 'admin-venues',
          component: () => import('@/pages/admin/AdminVenuesPage.vue'),
        },
        {
          path: 'agents',
          name: 'admin-agents',
          component: () => import('@/pages/admin/AdminAgentsPage.vue'),
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/pages/admin/AdminVenuesPage.vue'), // placeholder
        },
        {
          path: 'bookings',
          name: 'admin-bookings',
          component: () => import('@/pages/admin/AdminBookingsPage.vue'),
        },
        {
          path: 'categories',
          name: 'admin-categories',
          component: () => import('@/pages/admin/AdminCategoriesPage.vue'),
        },
        {
          path: 'venue-features',
          name: 'admin-venue-features',
          component: () => import('@/pages/admin/AdminVenueFeaturesPage.vue'),
        },
        {
          path: 'roles',
          name: 'admin-roles',
          component: () => import('@/pages/admin/AdminRolesPage.vue'),
        },
        {
          path: 'settings',
          name: 'admin-settings',
          component: () => import('@/pages/admin/AdminVenuesPage.vue'), // placeholder
        },
      ],
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
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'home' }
  }

  if (to.meta.requiresAgent && !auth.hasAgentAccess) {
    return { name: 'home' }
  }

  if (to.meta.guestOnly && auth.isLoggedIn) {
    if (auth.isAdmin) return { name: 'admin-venues' }
    if (auth.hasAgentAccess) return { name: 'agent-dashboard' }
    return { name: 'home' }
  }

  return true
})

export default router
