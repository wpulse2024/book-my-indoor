<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { rolesApi, permissionsApi } from '@/services/api'

const PROTECTED_ROLES = ['admin', 'agent', 'manager', 'user']

const roles = ref<any[]>([])
const allPermissions = ref<any[]>([])
const loading = ref(false)
const showModal = ref(false)
const editingRole = ref<any | null>(null)
const saving = ref(false)
const deleteTarget = ref<any | null>(null)
const deleting = ref(false)
const apiError = ref('')

function defaultForm() {
  return { name: '', description: '', permissions: [] as string[] }
}
const form = ref(defaultForm())
const formErrors = ref<Record<string, string>>({})

// Group permissions by resource prefix (e.g. "venues", "staff", "users")
const permissionGroups = computed(() => {
  const groups: Record<string, any[]> = {}
  for (const p of allPermissions.value) {
    const resource = p.name.split(':')[0]
    if (!groups[resource]) groups[resource] = []
    groups[resource].push(p)
  }
  return groups
})

async function load() {
  loading.value = true
  try {
    const [rolesRes, permsRes] = await Promise.all([rolesApi.list(), permissionsApi.list()])
    roles.value = Array.isArray(rolesRes.data) ? rolesRes.data : []
    allPermissions.value = Array.isArray(permsRes.data) ? permsRes.data : []
  } finally {
    loading.value = false
  }
}

onMounted(load)

function openCreate() {
  editingRole.value = null
  form.value = defaultForm()
  formErrors.value = {}
  apiError.value = ''
  showModal.value = true
}

function openEdit(role: any) {
  editingRole.value = role
  form.value = {
    name: role.name,
    description: role.description ?? '',
    permissions: (role.permissions ?? []).map((p: any) => p._id ?? p),
  }
  formErrors.value = {}
  apiError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function validate(): boolean {
  const errs: Record<string, string> = {}
  if (!form.value.name.trim()) errs.name = 'Role name is required'
  formErrors.value = errs
  return Object.keys(errs).length === 0
}

function togglePermission(permId: string) {
  const idx = form.value.permissions.indexOf(permId)
  if (idx === -1) form.value.permissions.push(permId)
  else form.value.permissions.splice(idx, 1)
}

function toggleGroup(resource: string) {
  const groupIds = (permissionGroups.value[resource] ?? []).map((p: any) => p._id)
  const allSelected = groupIds.every((id: string) => form.value.permissions.includes(id))
  if (allSelected) {
    form.value.permissions = form.value.permissions.filter((id) => !groupIds.includes(id))
  } else {
    const toAdd = groupIds.filter((id: string) => !form.value.permissions.includes(id))
    form.value.permissions.push(...toAdd)
  }
}

function isGroupAllSelected(resource: string): boolean {
  const groupIds = (permissionGroups.value[resource] ?? []).map((p: any) => p._id)
  return groupIds.length > 0 && groupIds.every((id: string) => form.value.permissions.includes(id))
}

function isGroupPartialSelected(resource: string): boolean {
  const groupIds = (permissionGroups.value[resource] ?? []).map((p: any) => p._id)
  return groupIds.some((id: string) => form.value.permissions.includes(id)) && !isGroupAllSelected(resource)
}

async function save() {
  if (!validate()) return
  saving.value = true
  apiError.value = ''
  try {
    const payload = {
      name: form.value.name.trim(),
      description: form.value.description.trim() || undefined,
      permissions: form.value.permissions,
    }
    if (editingRole.value) {
      const res = await rolesApi.update(editingRole.value._id, payload)
      const idx = roles.value.findIndex((r) => r._id === editingRole.value._id)
      if (idx !== -1) {
        // Hydrate permissions for display
        roles.value[idx] = {
          ...res.data,
          permissions: allPermissions.value.filter((p) => form.value.permissions.includes(p._id)),
        }
      }
    } else {
      const res = await rolesApi.create(payload)
      roles.value.push({
        ...res.data,
        permissions: allPermissions.value.filter((p) => form.value.permissions.includes(p._id)),
      })
    }
    closeModal()
  } catch (err: any) {
    apiError.value = err?.response?.data?.message ?? 'Failed to save role.'
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await rolesApi.remove(deleteTarget.value._id)
    roles.value = roles.value.filter((r) => r._id !== deleteTarget.value._id)
    deleteTarget.value = null
  } catch (err: any) {
    alert(err?.response?.data?.message ?? 'Failed to delete role.')
  } finally {
    deleting.value = false
  }
}

function permissionCount(role: any): number {
  return (role.permissions ?? []).length
}

function actionLabel(name: string): string {
  return name.split(':')[1] ?? name
}
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Roles & Permissions</h1>
        <p class="text-sm text-gray-500 mt-0.5">Define roles and the permissions each role grants</p>
      </div>
      <button
        @click="openCreate"
        class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        New Role
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <svg class="animate-spin w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
      </svg>
    </div>

    <!-- Roles grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="role in roles"
        :key="role._id"
        class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-gray-900 capitalize">{{ role.name }}</h3>
              <span
                v-if="PROTECTED_ROLES.includes(role.name)"
                class="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded"
              >
                system
              </span>
            </div>
            <p v-if="role.description" class="text-sm text-gray-500 mt-0.5 truncate">{{ role.description }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ permissionCount(role) }} permission{{ permissionCount(role) !== 1 ? 's' : '' }}</p>
          </div>
          <div class="flex items-center gap-1 flex-shrink-0">
            <button
              @click="openEdit(role)"
              class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Edit role"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button
              v-if="!PROTECTED_ROLES.includes(role.name)"
              @click="deleteTarget = role"
              class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete role"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Permission badges -->
        <div v-if="role.permissions?.length" class="mt-3 flex flex-wrap gap-1.5">
          <span
            v-for="perm in role.permissions.slice(0, 8)"
            :key="perm._id ?? perm"
            class="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium"
          >
            {{ perm.name ?? perm }}
          </span>
          <span
            v-if="role.permissions.length > 8"
            class="text-[11px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-medium"
          >
            +{{ role.permissions.length - 8 }} more
          </span>
        </div>
        <p v-else class="mt-3 text-xs text-gray-400 italic">No permissions assigned</p>
      </div>
    </div>
  </div>

  <!-- Create / Edit Modal -->
  <Teleport to="body">
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal"/>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6">
        <h2 class="text-lg font-bold text-gray-900 mb-5">
          {{ editingRole ? 'Edit Role' : 'New Role' }}
        </h2>

        <div v-if="apiError" class="mb-4 px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {{ apiError }}
        </div>

        <form @submit.prevent="save" class="space-y-5">
          <!-- Name + Description row -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="e.g. receptionist"
                :disabled="editingRole && PROTECTED_ROLES.includes(editingRole.name)"
                class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
                :class="formErrors.name ? 'border-red-400' : 'border-gray-300'"
              />
              <p v-if="formErrors.name" class="text-xs text-red-500 mt-1">{{ formErrors.name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Description <span class="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                v-model="form.description"
                type="text"
                placeholder="What does this role do?"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <!-- Permissions -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
            <div class="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 max-h-[340px] overflow-y-auto">
              <div
                v-for="(perms, resource) in permissionGroups"
                :key="resource"
                class="bg-white"
              >
                <!-- Group header -->
                <label class="flex items-center gap-3 px-4 py-2.5 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    :checked="isGroupAllSelected(resource)"
                    :indeterminate="isGroupPartialSelected(resource)"
                    @change="toggleGroup(resource)"
                    class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span class="text-xs font-bold text-gray-700 uppercase tracking-wider">{{ resource }}</span>
                  <span class="ml-auto text-xs text-gray-400">{{ perms.filter((p: any) => form.permissions.includes(p._id)).length }}/{{ perms.length }}</span>
                </label>
                <!-- Individual permissions -->
                <div class="px-4 py-2 flex flex-wrap gap-x-6 gap-y-1.5">
                  <label
                    v-for="perm in perms"
                    :key="perm._id"
                    class="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      :checked="form.permissions.includes(perm._id)"
                      @change="togglePermission(perm._id)"
                      class="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span class="text-sm text-gray-600 group-hover:text-gray-900">{{ actionLabel(perm.name) }}</span>
                  </label>
                </div>
              </div>
            </div>
            <p class="text-xs text-gray-400 mt-1.5">{{ form.permissions.length }} permission{{ form.permissions.length !== 1 ? 's' : '' }} selected</p>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-1">
            <button type="button" @click="closeModal" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
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
              {{ saving ? 'Saving…' : editingRole ? 'Save Changes' : 'Create Role' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>

  <!-- Delete confirmation -->
  <Teleport to="body">
    <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="deleteTarget = null"/>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-gray-900">Delete Role</h3>
            <p class="text-sm text-gray-500 mt-0.5">Delete the <span class="font-semibold capitalize">{{ deleteTarget?.name }}</span> role?</p>
          </div>
        </div>
        <p class="text-sm text-gray-500 mb-5">Staff members with this role will lose its permissions. This action cannot be undone.</p>
        <div class="flex justify-end gap-3">
          <button @click="deleteTarget = null" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          <button
            @click="confirmDelete"
            :disabled="deleting"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            <svg v-if="deleting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            {{ deleting ? 'Deleting…' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
