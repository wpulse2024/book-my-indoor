<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { staffApi, rolesApi } from '@/services/api'

const staff = ref<any[]>([])
const availableRoles = ref<any[]>([])
const loading = ref(false)
const showModal = ref(false)
const saving = ref(false)
const deleteTarget = ref<any | null>(null)
const deleting = ref(false)
const apiError = ref('')

function defaultForm() {
  return { name: '', phone: '', email: '', password: '', roleId: '' }
}
const form = ref(defaultForm())
const formErrors = ref<Record<string, string>>({})

async function load() {
  loading.value = true
  const [staffRes, rolesRes] = await Promise.allSettled([
    staffApi.list(),
    rolesApi.listNonAdmin(),
  ])
  staff.value = staffRes.status === 'fulfilled' && Array.isArray(staffRes.value.data)
    ? staffRes.value.data
    : []
  availableRoles.value = rolesRes.status === 'fulfilled' && Array.isArray(rolesRes.value.data)
    ? rolesRes.value.data
    : []
  loading.value = false
}

onMounted(load)

function openModal() {
  form.value = defaultForm()
  formErrors.value = {}
  apiError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function validate(): boolean {
  const errs: Record<string, string> = {}
  if (!form.value.name.trim()) errs.name = 'Name is required'
  if (!form.value.phone.trim()) errs.phone = 'Phone is required'
  if (!form.value.password || form.value.password.length < 6)
    errs.password = 'Password must be at least 6 characters'
  formErrors.value = errs
  return Object.keys(errs).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  apiError.value = ''
  try {
    const payload: any = {
      name: form.value.name.trim(),
      phone: form.value.phone.trim(),
      password: form.value.password,
    }
    if (form.value.email.trim()) payload.email = form.value.email.trim()
    if (form.value.roleId) payload.roleId = form.value.roleId
    const res = await staffApi.create(payload)
    staff.value.unshift(res.data)
    closeModal()
  } catch (err: any) {
    apiError.value =
      err?.response?.data?.message ?? 'Failed to add staff member. Please try again.'
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await staffApi.remove(deleteTarget.value._id)
    staff.value = staff.value.filter((s) => s._id !== deleteTarget.value._id)
    deleteTarget.value = null
  } catch (err: any) {
    alert(err?.response?.data?.message ?? 'Failed to remove staff member.')
  } finally {
    deleting.value = false
  }
}

function roleName(member: any): string {
  const roles = member.roles ?? []
  if (!roles.length) return 'No role'
  return roles.map((r: any) => (typeof r === 'string' ? r : r?.name ?? '')).join(', ')
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Staff & Roles</h1>
        <p class="text-sm text-gray-500 mt-0.5">Manage your organization's staff members</p>
      </div>
      <button
        @click="openModal"
        class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Add Staff
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <svg class="animate-spin w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
      </svg>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="staff.length === 0"
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <div class="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
        <svg class="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </div>
      <p class="text-gray-700 font-semibold">No staff members yet</p>
      <p class="text-sm text-gray-400 mt-1">Add your first staff member to get started.</p>
      <button
        @click="openModal"
        class="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Add Staff Member
      </button>
    </div>

    <!-- Staff table -->
    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-4 py-3 font-semibold text-gray-600">Member</th>
            <th class="text-left px-4 py-3 font-semibold text-gray-600">Phone</th>
            <th class="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
            <th class="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
            <th class="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="member in staff" :key="member._id" class="hover:bg-gray-50/50 transition-colors">
            <!-- Avatar + Name -->
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {{ initials(member.name || member.phone) }}
                </div>
                <span class="font-medium text-gray-900">{{ member.name || '—' }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ member.phone }}</td>
            <td class="px-4 py-3 text-gray-500">{{ member.email || '—' }}</td>
            <td class="px-4 py-3">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 capitalize">
                {{ roleName(member) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span
                :class="member.isActive
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-600'"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
              >
                {{ member.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <button
                @click="deleteTarget = member"
                class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove staff member"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Add Staff Modal -->
  <Teleport to="body">
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="closeModal"
    >
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal"/>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <h2 class="text-lg font-bold text-gray-900 mb-5">Add Staff Member</h2>

        <!-- API error -->
        <div
          v-if="apiError"
          class="mb-4 px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg"
        >
          {{ apiError }}
        </div>

        <form @submit.prevent="save" class="space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="e.g. Sakib Al Hasan"
              class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :class="formErrors.name ? 'border-red-400' : 'border-gray-300'"
            />
            <p v-if="formErrors.name" class="text-xs text-red-500 mt-1">{{ formErrors.name }}</p>
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              v-model="form.phone"
              type="tel"
              placeholder="+8801XXXXXXXXX"
              class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :class="formErrors.phone ? 'border-red-400' : 'border-gray-300'"
            />
            <p v-if="formErrors.phone" class="text-xs text-red-500 mt-1">{{ formErrors.phone }}</p>
          </div>

          <!-- Email (optional) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email <span class="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              v-model="form.email"
              type="email"
              placeholder="staff@example.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <!-- Role -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Role <span class="text-gray-400 font-normal">(optional — defaults to "user")</span>
            </label>
            <select
              v-model="form.roleId"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">— Default (user) —</option>
              <option v-for="role in availableRoles.filter((r: any) => r.name !== 'agent')" :key="role._id" :value="role._id">
                {{ role.name }}{{ role.description ? ` — ${role.description}` : '' }}
              </option>
            </select>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="Min. 6 characters"
              class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :class="formErrors.password ? 'border-red-400' : 'border-gray-300'"
            />
            <p v-if="formErrors.password" class="text-xs text-red-500 mt-1">{{ formErrors.password }}</p>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center gap-2"
            >
              <svg v-if="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              {{ saving ? 'Adding…' : 'Add Member' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>

  <!-- Delete confirmation modal -->
  <Teleport to="body">
    <div
      v-if="deleteTarget"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="deleteTarget = null"/>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-gray-900">Remove Staff Member</h3>
            <p class="text-sm text-gray-500 mt-0.5">
              Remove <span class="font-semibold">{{ deleteTarget?.name || deleteTarget?.phone }}</span> from your organization?
            </p>
          </div>
        </div>
        <p class="text-sm text-gray-500 mb-5">This will permanently delete their account. This action cannot be undone.</p>
        <div class="flex justify-end gap-3">
          <button
            @click="deleteTarget = null"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="confirmDelete"
            :disabled="deleting"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            <svg v-if="deleting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            {{ deleting ? 'Removing…' : 'Remove' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
