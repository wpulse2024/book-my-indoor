<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import TheNavbar from '@/components/TheNavbar.vue'
import AccountSidebar from '@/components/account/AccountSidebar.vue'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()

const form = reactive({
  name: auth.user?.name ?? '',
  email: auth.user?.email ?? '',
})

watch(
  () => auth.user,
  (u) => {
    if (u) {
      form.name = u.name ?? ''
      form.email = u.email ?? ''
    }
  },
)

const success = ref('')
const error = ref('')
const saving = ref(false)

async function saveProfile() {
  error.value = ''
  success.value = ''
  saving.value = true
  try {
    await auth.updateProfile({ name: form.name, email: form.email || undefined })
    success.value = 'Profile updated successfully.'
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Update failed. Please try again.'
  } finally {
    saving.value = false
  }
}

const initials = () => {
  const name = auth.user?.name ?? ''
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <TheNavbar />

    <main class="max-w-6xl mx-auto px-6 py-8">
      <div class="flex gap-8 items-start">

        <!-- Sidebar -->
        <AccountSidebar />

        <!-- Main content -->
        <div class="flex-1 min-w-0 space-y-6">

          <!-- Header -->
          <div class="bg-white rounded-2xl border border-gray-100 p-6">
            <h1 class="font-black text-gray-900 text-2xl mb-1">Profile Settings</h1>
            <p class="text-gray-400 text-sm">Manage your personal information and account details.</p>
          </div>

          <!-- Profile card + form -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- Avatar card -->
            <div class="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center text-center gap-4">
              <div class="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-2xl select-none">
                {{ initials() }}
              </div>
              <div>
                <p class="font-bold text-gray-900 text-base">{{ auth.user?.name || '—' }}</p>
                <p class="text-gray-400 text-sm mt-0.5">{{ auth.user?.phone }}</p>
              </div>
              <div class="w-full border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-400">Member since</span>
                  <span class="font-semibold text-gray-700">
                    {{ auth.user?.createdAt
                      ? new Date(auth.user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                      : '—' }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Wallet</span>
                  <span class="font-semibold text-green-600">
                    ৳{{ auth.user?.walletBalance?.toFixed(2) ?? '0.00' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Edit form -->
            <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
              <h2 class="font-bold text-gray-900 text-base mb-5">Personal Information</h2>

              <!-- Success banner -->
              <div v-if="success" class="mb-5 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                {{ success }}
              </div>

              <!-- Error banner -->
              <div v-if="error" class="mb-5 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ error }}
              </div>

              <form class="space-y-4" @submit.prevent="saveProfile">
                <!-- Full Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input
                    v-model="form.name"
                    type="text"
                    placeholder="Enter your full name"
                    class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    v-model="form.email"
                    type="email"
                    placeholder="Optional"
                    class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <!-- Phone (read-only) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <div class="relative">
                    <input
                      :value="auth.user?.phone"
                      type="tel"
                      disabled
                      class="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-400 cursor-not-allowed"
                    />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                    </span>
                  </div>
                  <p class="mt-1 text-xs text-gray-400">Phone number cannot be changed</p>
                </div>

                <!-- Submit -->
                <div class="pt-2">
                  <button
                    type="submit"
                    :disabled="saving"
                    class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    <span v-if="saving" class="flex items-center gap-2">
                      <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Saving…
                    </span>
                    <span v-else>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>
