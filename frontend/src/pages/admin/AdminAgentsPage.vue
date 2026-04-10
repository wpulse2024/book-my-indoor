<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { organizationApi } from '@/services/api'
import axios from 'axios'

// ── State ──────────────────────────────────────────────────────────────────
const orgs = ref<any[]>([])
const isLoading = ref(false)
const error = ref('')
const search = ref('')
const showInviteModal = ref(false)
const isSubmitting = ref(false)
const deleteTarget = ref<any | null>(null)
const isDeleting = ref(false)

// ── Invite form ────────────────────────────────────────────────────────────
const form = ref({
  title: '',
  commissionType: 'percentage' as 'fixed' | 'percentage',
  commissionAmount: 10,
  agent: { phone: '', email: '', password: '' },
})
const formError = ref('')

// ── Computed ───────────────────────────────────────────────────────────────
const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return orgs.value
  return orgs.value.filter(o =>
    o.title?.toLowerCase().includes(q) ||
    o.agentId?.email?.toLowerCase().includes(q) ||
    o.agentId?.phone?.includes(q),
  )
})

const stats = computed(() => ({
  total: orgs.value.length,
  active: orgs.value.filter(o => o.agentId?.isActive !== false).length,
}))

// ── Methods ────────────────────────────────────────────────────────────────
async function loadOrgs() {
  isLoading.value = true
  error.value = ''
  try {
    const res = await organizationApi.list()
    orgs.value = res.data
  } catch (e) {
    error.value = getMsg(e, 'Failed to load agents.')
  } finally {
    isLoading.value = false
  }
}

async function submitInvite() {
  formError.value = ''
  if (!form.value.title || !form.value.agent.phone || !form.value.agent.password) {
    formError.value = 'Organization name, phone and password are required.'
    return
  }
  isSubmitting.value = true
  try {
    const res = await organizationApi.create({
      ...form.value,
      agent: {
        phone: form.value.agent.phone,
        email: form.value.agent.email || undefined,
        password: form.value.agent.password,
      },
    })
    orgs.value.unshift(res.data)
    showInviteModal.value = false
    resetForm()
  } catch (e) {
    formError.value = getMsg(e, 'Failed to create agent.')
  } finally {
    isSubmitting.value = false
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  isDeleting.value = true
  try {
    await organizationApi.remove(deleteTarget.value._id)
    orgs.value = orgs.value.filter(o => o._id !== deleteTarget.value._id)
    deleteTarget.value = null
  } catch (e) {
    error.value = getMsg(e, 'Failed to delete agent.')
  } finally {
    isDeleting.value = false
  }
}

function resetForm() {
  form.value = {
    title: '',
    commissionType: 'percentage',
    commissionAmount: 10,
    agent: { phone: '', email: '', password: '' },
  }
  formError.value = ''
}

function getMsg(cause: unknown, fallback: string) {
  if (axios.isAxiosError(cause)) {
    const msg = cause.response?.data?.message
    if (Array.isArray(msg)) return msg[0] ?? fallback
    if (typeof msg === 'string') return msg
  }
  return fallback
}

function agentAvatar(org: any) {
  const name = org.agentId?.name || org.agentId?.email || org.title || 'A'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&bold=true&size=80`
}

onMounted(loadOrgs)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-2xl font-black text-gray-900">Agents</h1>
        <p class="text-gray-500 text-sm mt-1">Manage and monitor indoor venue owners and platform tenants.</p>
      </div>
      <button
        @click="showInviteModal = true"
        class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        Invite Agent
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-2xl border border-gray-100 px-6 py-5">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Agents</p>
        <div class="flex items-end gap-3">
          <p class="text-4xl font-black text-gray-900">{{ isLoading ? '—' : stats.total.toLocaleString() }}</p>
          <span class="text-green-500 text-sm font-bold mb-1 flex items-center gap-0.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
            12%
          </span>
        </div>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 px-6 py-5">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Active Agents</p>
        <div class="flex items-end gap-3">
          <p class="text-4xl font-black text-gray-900">{{ isLoading ? '—' : stats.active.toLocaleString() }}</p>
          <span class="text-blue-500 text-sm font-bold mb-1">Live now</span>
        </div>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 px-6 py-5">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Revenue Growth</p>
        <div class="flex items-end gap-2">
          <p class="text-4xl font-black text-gray-900">$42.8k</p>
          <span class="text-gray-400 text-sm font-medium mb-1">Monthly</span>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="relative mb-4">
      <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        v-model="search"
        type="text"
        placeholder="Search agents..."
        class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
      />
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{{ error }}</div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-5">
      <!-- Loading skeleton -->
      <div v-if="isLoading" class="p-8 text-center text-gray-400 text-sm">Loading agents...</div>

      <!-- Empty -->
      <div v-else-if="filtered.length === 0" class="p-12 text-center">
        <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="font-bold text-gray-700">No agents found</p>
        <p class="text-sm text-gray-400 mt-1">Invite your first agent to get started.</p>
      </div>

      <!-- Table -->
      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Agent Name</th>
            <th class="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
            <th class="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Commission</th>
            <th class="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Subscription</th>
            <th class="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
            <th class="text-right px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="org in filtered" :key="org._id" class="hover:bg-gray-50/50 transition-colors">
            <!-- Agent name -->
            <td class="px-5 py-4">
              <div class="flex items-center gap-3">
                <img :src="agentAvatar(org)" :alt="org.title" class="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                <div>
                  <p class="text-sm font-bold text-gray-900">{{ org.title }}</p>
                  <p class="text-xs text-gray-400">{{ org.agentId?.phone || '—' }}</p>
                </div>
              </div>
            </td>
            <!-- Email -->
            <td class="px-5 py-4 text-sm text-gray-600">{{ org.agentId?.email || '—' }}</td>
            <!-- Commission -->
            <td class="px-5 py-4">
              <span class="text-sm font-semibold text-gray-800">
                {{ org.commissionAmount }}{{ org.commissionType === 'percentage' ? '%' : ' ৳' }}
              </span>
              <span class="text-xs text-gray-400 ml-1">{{ org.commissionType }}</span>
            </td>
            <!-- Subscription (placeholder) -->
            <td class="px-5 py-4">
              <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wide bg-indigo-600 text-white">
                Pro
              </span>
            </td>
            <!-- Status -->
            <td class="px-5 py-4">
              <span
                class="inline-flex items-center gap-1.5 text-xs font-bold"
                :class="org.agentId?.isActive !== false ? 'text-green-600' : 'text-red-500'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="org.agentId?.isActive !== false ? 'bg-green-500' : 'bg-red-500'"></span>
                {{ org.agentId?.isActive !== false ? 'Active' : 'Suspended' }}
              </span>
            </td>
            <!-- Actions -->
            <td class="px-5 py-4 text-right">
              <div class="flex items-center justify-end gap-1">
                <button class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                </button>
                <button
                  @click="deleteTarget = org"
                  class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination footer -->
      <div v-if="filtered.length > 0" class="flex items-center justify-between px-5 py-4 border-t border-gray-100">
        <p class="text-sm text-gray-500">Showing <span class="font-semibold text-gray-800">{{ filtered.length }}</span> of <span class="font-semibold text-gray-800">{{ stats.total }}</span> agents</p>
        <div class="flex items-center gap-1">
          <button class="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button class="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold">1</button>
          <button class="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Promo banner -->
    <div class="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 rounded-2xl p-6 flex items-center justify-between overflow-hidden relative">
      <div class="relative z-10">
        <h3 class="text-white font-black text-lg">Scaling Your Network?</h3>
        <p class="text-indigo-200 text-sm mt-1 max-w-lg leading-relaxed">
          Agents with Pro plans are currently seeing a 45% higher booking rate this quarter. Consider promoting high-value agents to featured status.
        </p>
        <button class="mt-4 px-4 py-2 bg-white text-indigo-700 text-sm font-bold rounded-xl hover:bg-indigo-50 transition-colors">
          View Analytics
        </button>
      </div>
      <!-- Decorative -->
      <div class="absolute right-6 bottom-0 opacity-10">
        <svg class="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
      </div>
    </div>

    <!-- ── Invite Modal ─────────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="showInviteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showInviteModal = false; resetForm()" />

          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
          >
            <div v-if="showInviteModal" class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
              <div class="flex items-center justify-between mb-5">
                <div>
                  <h2 class="text-lg font-black text-gray-900">Invite Agent</h2>
                  <p class="text-xs text-gray-400 mt-0.5">Create an organization and agent account.</p>
                </div>
                <button @click="showInviteModal = false; resetForm()" class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              <form @submit.prevent="submitInvite" class="space-y-4">
                <!-- Org name -->
                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Organization Name</label>
                  <input v-model="form.title" type="text" placeholder="e.g. Kinetic Sports Ltd." class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
                </div>

                <!-- Agent phone -->
                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Agent Phone</label>
                  <input v-model="form.agent.phone" type="tel" placeholder="+8801XXXXXXXXX" class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
                </div>

                <!-- Agent email -->
                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Agent Email <span class="text-gray-400 font-normal normal-case">(optional)</span></label>
                  <input v-model="form.agent.email" type="email" placeholder="agent@example.com" class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
                </div>

                <!-- Password -->
                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                  <input v-model="form.agent.password" type="password" placeholder="Min. 6 characters" class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
                </div>

                <!-- Commission -->
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Commission Type</label>
                    <select v-model="form.commissionType" class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 bg-white cursor-pointer">
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed (৳)</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Amount</label>
                    <input v-model.number="form.commissionAmount" type="number" min="1" class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
                  </div>
                </div>

                <p v-if="formError" class="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{{ formError }}</p>

                <div class="flex gap-3 pt-1">
                  <button type="button" @click="showInviteModal = false; resetForm()" class="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" :disabled="isSubmitting" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors">
                    {{ isSubmitting ? 'Creating...' : 'Create Agent' }}
                  </button>
                </div>
              </form>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Delete Confirm Modal ────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-100" leave-to-class="opacity-0">
        <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="deleteTarget = null" />
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
            <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
            </div>
            <h3 class="text-center font-black text-gray-900 text-lg">Delete Agent?</h3>
            <p class="text-center text-sm text-gray-500 mt-1">
              <strong class="text-gray-800">{{ deleteTarget?.title }}</strong> will be permanently removed. This cannot be undone.
            </p>
            <div class="flex gap-3 mt-5">
              <button @click="deleteTarget = null" class="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
              <button @click="confirmDelete" :disabled="isDeleting" class="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors">
                {{ isDeleting ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
