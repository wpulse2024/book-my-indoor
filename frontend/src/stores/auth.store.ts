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
  const isInitialized = ref(USE_MOCK ? true : false)

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  function setToken(t: string) {
    token.value = t
    localStorage.setItem('bmi_token', t)
  }

  function normalizeUser(data: any | null | undefined): User | null {
    if (!data) return null

    return {
      id: data.id ?? data._id?.toString() ?? '',
      name: data.name ?? data.phone ?? 'User',
      email: data.email ?? '',
      phone: data.phone ?? '',
      avatar: data.avatar ?? null,
      walletBalance: data.walletBalance ?? 0,
      autoCreated: data.autoCreated ?? false,
      createdAt: data.createdAt ?? new Date().toISOString(),
    }
  }

  function setSession(accessToken: string, currentUser: Partial<User>) {
    setToken(accessToken)
    user.value = normalizeUser(currentUser)
  }

  function clearAuth() {
    user.value = null
    token.value = null
    localStorage.removeItem('bmi_token')
  }

  async function fetchMe() {
    if (!token.value) {
      isInitialized.value = true
      return
    }
    try {
      const res = await authApi.profile()
      user.value = normalizeUser(res.data)
    } catch {
      clearAuth()
    } finally {
      isInitialized.value = true
    }
  }

  async function loginWithOtp(phone: string, otp: string) {
    isLoading.value = true
    try {
      const res = await authApi.verifyLoginOtp(phone, otp)
      setSession(res.data.accessToken, res.data.user ?? { phone })
    } finally {
      isLoading.value = false
    }
  }

  async function loginWithPassword(identifier: string, password: string) {
    isLoading.value = true
    try {
      const res = await authApi.login({ identifier, password, isOtpLogin: false })
      if (!res.data.accessToken || !res.data.user) {
        throw new Error('Login response did not include a session')
      }

      setSession(res.data.accessToken, res.data.user)
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    clearAuth()
  }

  async function updateProfile(data: Partial<User>) {
    isLoading.value = true
    try {
      await authApi.updateProfile(data)
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    token,
    isLoading,
    isInitialized,
    isLoggedIn,
    fetchMe,
    loginWithOtp,
    loginWithPassword,
    logout,
    updateProfile,
    clearAuth,
    setSession,
  }
})
