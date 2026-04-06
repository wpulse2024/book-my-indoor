import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/services/api'
import type { User } from '@/types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const MOCK_USER: User = {
  id: 'u1',
  name: 'Rafiq Ahmed',
  email: 'rafiq@example.com',
  phone: '01711000001',
  avatar: null,
  walletBalance: 2700,
  autoCreated: false,
  createdAt: '2024-01-15T00:00:00Z',
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(USE_MOCK ? MOCK_USER : null)
  const token = ref<string | null>(USE_MOCK ? 'mock-token' : localStorage.getItem('bmi_token'))
  const isLoading = ref(false)

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  function setToken(t: string) {
    token.value = t
    localStorage.setItem('bmi_token', t)
  }

  function clearAuth() {
    user.value = null
    token.value = null
    localStorage.removeItem('bmi_token')
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      const res = await authApi.me()
      user.value = res.data.data
    } catch {
      clearAuth()
    }
  }

  async function loginWithOtp(phone: string, otp: string) {
    isLoading.value = true
    try {
      const res = await authApi.verifyOtp(phone, otp)
      setToken(res.data.data.token)
      user.value = res.data.data.user
    } finally {
      isLoading.value = false
    }
  }

  async function loginWithPassword(email: string, password: string) {
    isLoading.value = true
    try {
      const res = await authApi.login({ email, password })
      setToken(res.data.data.token)
      user.value = res.data.data.user
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try { await authApi.logout() } catch { /* ignore */ }
    clearAuth()
  }

  async function updateProfile(data: Partial<User>) {
    isLoading.value = true
    try {
      const res = await authApi.updateProfile(data)
      user.value = res.data.data
    } finally {
      isLoading.value = false
    }
  }

  // Hydrate on startup if token exists
  if (token.value) fetchMe()

  return {
    user,
    token,
    isLoading,
    isLoggedIn,
    fetchMe,
    loginWithOtp,
    loginWithPassword,
    logout,
    updateProfile,
    clearAuth,
  }
})
