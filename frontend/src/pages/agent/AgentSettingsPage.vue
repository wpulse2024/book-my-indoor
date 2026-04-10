<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { organizationApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth.store'
import axios from 'axios'

const auth = useAuthStore()

// ── State ──────────────────────────────────────────────────────────────────
const isLoadingOrg = ref(false)
const isSavingOrg = ref(false)
const orgError = ref('')
const orgSuccess = ref('')

const orgId = computed(() => {
  const raw = auth.user as any
  if (!raw) return null
  const org = raw.organization
  if (!org) return null
  return typeof org === 'string' ? org : org?._id ?? org?.id ?? null
})

const orgForm = reactive({
  title: '',
  commissionType: 'percentage' as 'fixed' | 'percentage',
  commissionAmount: 0,
  logo: '',
  place: '',
  description: '',
})

const agentInfo = computed(() => ({
  phone: auth.user?.phone ?? '—',
  email: auth.user?.email ?? '—',
  name: auth.user?.name ?? '—',
}))

// ── Load org ───────────────────────────────────────────────────────────────
async function loadOrg() {
  if (!orgId.value) {
    orgError.value = 'No organization linked to this account.'
    return
  }
  isLoadingOrg.value = true
  orgError.value = ''
  try {
    const res = await organizationApi.get(orgId.value)
    orgForm.title = res.data.title ?? ''
    orgForm.commissionType = res.data.commissionType ?? 'percentage'
    orgForm.commissionAmount = res.data.commissionAmount ?? 0
    orgForm.logo = res.data.logo ?? ''
    orgForm.place = res.data.place ?? ''
    orgForm.description = res.data.description ?? ''
  } catch (e) {
    orgError.value = getMsg(e, 'Failed to load organization details.')
  } finally {
    isLoadingOrg.value = false
  }
}

// ── Save org ───────────────────────────────────────────────────────────────
async function saveOrg() {
  if (!orgId.value) return
  orgError.value = ''
  orgSuccess.value = ''
  isSavingOrg.value = true
  try {
    await organizationApi.update(orgId.value, {
      title: orgForm.title,
      commissionType: orgForm.commissionType,
      commissionAmount: orgForm.commissionAmount,
      logo: orgForm.logo || undefined,
      place: orgForm.place || undefined,
      description: orgForm.description || undefined,
    })
    orgSuccess.value = 'Organization settings saved successfully.'
    setTimeout(() => { orgSuccess.value = '' }, 4000)
  } catch (e) {
    orgError.value = getMsg(e, 'Failed to save settings.')
  } finally {
    isSavingOrg.value = false
  }
}

function getMsg(cause: unknown, fallback: string) {
  if (axios.isAxiosError(cause)) {
    const msg = cause.response?.data?.message
    if (Array.isArray(msg)) return msg[0] ?? fallback
    if (typeof msg === 'string') return msg
  }
  return fallback
}

onMounted(loadOrg)
</script>

<template>
  <div class="max-w-2xl">
    <!-- Header -->
    <div class="mb-7">
      <h1 class="text-2xl font-black text-gray-900">Settings</h1>
      <p class="text-gray-500 text-sm mt-1">Manage your organization profile and account preferences.</p>
    </div>

    <!-- ── Agent Profile (read-only) ─────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
      <div class="flex items-center gap-4 mb-5">
        <div class="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-indigo-100">
          <img
            :src="auth.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user?.name || auth.user?.phone || 'A')}&background=4f46e5&color=fff&bold=true&size=120`"
            class="w-full h-full object-cover"
            :alt="auth.user?.name"
          />
        </div>
        <div>
          <p class="font-black text-gray-900 text-lg leading-none">{{ agentInfo.name }}</p>
          <p class="text-sm text-gray-400 mt-1">Agent Account</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Phone</label>
          <div class="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700">
            <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            {{ agentInfo.phone }}
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
          <div class="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700">
            <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            {{ agentInfo.email || '—' }}
          </div>
        </div>
      </div>
      <p class="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        Contact your administrator to update phone or email.
      </p>
    </div>

    <!-- ── Organization Settings ─────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-5">
        <div>
          <h2 class="font-black text-gray-900">Organization Profile</h2>
          <p class="text-xs text-gray-400 mt-0.5">Update your organization details and commission configuration.</p>
        </div>
        <span v-if="orgId" class="text-[10px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg font-mono">
          ID: {{ orgId.slice(-8) }}
        </span>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isLoadingOrg" class="space-y-4">
        <div class="h-10 bg-gray-100 rounded-xl animate-pulse" />
        <div class="h-10 bg-gray-100 rounded-xl animate-pulse" />
        <div class="grid grid-cols-2 gap-4">
          <div class="h-10 bg-gray-100 rounded-xl animate-pulse" />
          <div class="h-10 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div class="h-20 bg-gray-100 rounded-xl animate-pulse" />
      </div>

      <!-- No org linked -->
      <div v-else-if="!orgId && !isLoadingOrg" class="py-8 text-center">
        <div class="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
        </div>
        <p class="font-bold text-gray-700 text-sm">No organization linked</p>
        <p class="text-xs text-gray-400 mt-1">Ask your administrator to link an organization to your account.</p>
      </div>

      <!-- Form -->
      <form v-else @submit.prevent="saveOrg" class="space-y-5">

        <!-- Logo + Name row -->
        <div class="flex items-start gap-4">
          <!-- Logo preview -->
          <div class="flex-shrink-0">
            <div class="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
              <img
                v-if="orgForm.logo"
                :src="orgForm.logo"
                alt="Organization logo"
                class="w-full h-full object-cover"
                @error="orgForm.logo = ''"
              />
              <svg v-else class="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
          </div>
          <!-- Name + logo URL -->
          <div class="flex-1 space-y-3">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Organization Name <span class="text-red-400">*</span></label>
              <input
                v-model="orgForm.title"
                type="text"
                placeholder="e.g. Kinetic Sports Ltd."
                class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition bg-white"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Logo URL <span class="text-gray-400 font-normal normal-case">(optional)</span></label>
              <input
                v-model="orgForm.logo"
                type="url"
                placeholder="https://example.com/logo.png"
                class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition bg-white"
              />
            </div>
          </div>
        </div>

        <!-- Place -->
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            <span class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              Place / Address
            </span>
          </label>
          <input
            v-model="orgForm.place"
            type="text"
            placeholder="e.g. Gulshan 2, Dhaka, Bangladesh"
            class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition bg-white"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description <span class="text-gray-400 font-normal normal-case">(what does your org offer?)</span></label>
          <textarea
            v-model="orgForm.description"
            rows="3"
            placeholder="e.g. We manage 4 premium badminton courts and 2 futsal arenas in central Dhaka, open daily from 6 AM to midnight."
            class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition bg-white resize-none leading-relaxed"
          />
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-100 pt-1">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Commission Configuration</p>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-500 font-medium mb-1.5">Type</label>
              <select
                v-model="orgForm.commissionType"
                class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-indigo-400 bg-white cursor-pointer transition"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (৳)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-500 font-medium mb-1.5">
                Amount <span class="text-gray-400">{{ orgForm.commissionType === 'percentage' ? '(%)' : '(৳)' }}</span>
              </label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium select-none">
                  {{ orgForm.commissionType === 'percentage' ? '%' : '৳' }}
                </span>
                <input
                  v-model.number="orgForm.commissionAmount"
                  type="number"
                  min="1"
                  :max="orgForm.commissionType === 'percentage' ? 100 : undefined"
                  class="w-full pl-8 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition bg-white"
                />
              </div>
            </div>
          </div>
          <p class="text-xs text-gray-400 mt-2">
            Current rate:
            <span class="font-bold text-gray-700">
              {{ orgForm.commissionAmount }}{{ orgForm.commissionType === 'percentage' ? '%' : ' ৳' }} per booking
            </span>
          </p>
        </div>

        <!-- Feedback messages -->
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150" leave-to-class="opacity-0">
          <div v-if="orgError" class="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {{ orgError }}
          </div>
        </Transition>

        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150" leave-to-class="opacity-0">
          <div v-if="orgSuccess" class="flex items-center gap-2.5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            {{ orgSuccess }}
          </div>
        </Transition>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-1 border-t border-gray-100">
          <button type="button" @click="loadOrg" :disabled="isLoadingOrg || isSavingOrg" class="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
            Reset
          </button>
          <button type="submit" :disabled="isSavingOrg || !orgForm.title" class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors">
            <svg v-if="isSavingOrg" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
            {{ isSavingOrg ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
