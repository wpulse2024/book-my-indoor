<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { categoryApi, assetUrl } from '@/services/api'
import axios from 'axios'

// ── State ──────────────────────────────────────────────────────────────────
const categories = ref<any[]>([])
const isLoading = ref(false)
const error = ref('')
const search = ref('')

// Modal state
const showModal = ref(false)
const isEditing = ref(false)
const editTarget = ref<any | null>(null)
const isSubmitting = ref(false)
const formError = ref('')

const deleteTarget = ref<any | null>(null)
const isDeleting = ref(false)

const form = ref({ title: '' })
const imageFile = ref<File | null>(null)
const imagePreview = ref<string>('')

// ── Computed ───────────────────────────────────────────────────────────────
const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return categories.value
  return categories.value.filter(c => c.title?.toLowerCase().includes(q))
})

// ── Helpers ────────────────────────────────────────────────────────────────
function getMsg(cause: unknown, fallback: string) {
  if (axios.isAxiosError(cause)) {
    const msg = cause.response?.data?.message
    if (Array.isArray(msg)) return msg[0] ?? fallback
    if (typeof msg === 'string') return msg
  }
  return fallback
}

function openCreate() {
  isEditing.value = false
  editTarget.value = null
  form.value = { title: '' }
  imageFile.value = null
  imagePreview.value = ''
  formError.value = ''
  showModal.value = true
}

function openEdit(cat: any) {
  isEditing.value = true
  editTarget.value = cat
  form.value = { title: cat.title }
  imageFile.value = null
  imagePreview.value = assetUrl(cat.image)
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  formError.value = ''
}

function onImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}

// ── API Methods ────────────────────────────────────────────────────────────
async function loadCategories() {
  isLoading.value = true
  error.value = ''
  try {
    const res = await categoryApi.list()
    categories.value = res.data
  } catch (e) {
    error.value = getMsg(e, 'Failed to load categories.')
  } finally {
    isLoading.value = false
  }
}

async function submitForm() {
  formError.value = ''
  if (!form.value.title.trim()) { formError.value = 'Title is required.'; return }
  if (!isEditing.value && !imageFile.value) { formError.value = 'Image is required.'; return }

  const fd = new FormData()
  fd.append('title', form.value.title.trim())
  if (imageFile.value) fd.append('image', imageFile.value)

  isSubmitting.value = true
  try {
    if (isEditing.value && editTarget.value) {
      const res = await categoryApi.update(editTarget.value._id, fd)
      const idx = categories.value.findIndex(c => c._id === editTarget.value._id)
      if (idx !== -1) categories.value[idx] = res.data
    } else {
      const res = await categoryApi.create(fd)
      categories.value.push(res.data)
    }
    closeModal()
  } catch (e) {
    formError.value = getMsg(e, 'Failed to save category.')
  } finally {
    isSubmitting.value = false
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  isDeleting.value = true
  try {
    await categoryApi.remove(deleteTarget.value._id)
    categories.value = categories.value.filter(c => c._id !== deleteTarget.value._id)
    deleteTarget.value = null
  } catch (e) {
    error.value = getMsg(e, 'Failed to delete category.')
  } finally {
    isDeleting.value = false
  }
}

onMounted(loadCategories)
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-2xl font-black text-gray-900">Categories</h1>
        <p class="text-gray-500 text-sm mt-1">Manage venue sport and activity categories shown to users.</p>
      </div>
      <button
        @click="openCreate"
        class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
        </svg>
        Add Category
      </button>
    </div>

    <!-- Search -->
    <div class="relative mb-5">
      <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input
        v-model="search"
        type="text"
        placeholder="Search categories..."
        class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
      />
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{{ error }}</div>

    <!-- Loading -->
    <div v-if="isLoading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="i in 8" :key="i" class="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
        <div class="h-36 bg-gray-100" />
        <div class="p-4">
          <div class="h-4 bg-gray-100 rounded-lg w-2/3" />
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="filtered.length === 0 && !isLoading" class="bg-white rounded-2xl border border-gray-100 py-16 text-center">
      <div class="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/>
        </svg>
      </div>
      <p class="font-bold text-gray-700">No categories yet</p>
      <p class="text-sm text-gray-400 mt-1 mb-5">Add your first category to get started.</p>
      <button @click="openCreate" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors">
        Add Category
      </button>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="cat in filtered"
        :key="cat._id"
        class="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow"
      >
        <!-- Image -->
        <div class="relative h-36 bg-gray-100 overflow-hidden">
          <img
            :src="assetUrl(cat.image)"
            :alt="cat.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            @error="(e: any) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cat.title)}&background=6366f1&color=fff&size=200&bold=true`"
          />
          <!-- Action overlay -->
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              @click="openEdit(cat)"
              class="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Edit"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button
              @click="deleteTarget = cat"
              class="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
        <!-- Title -->
        <div class="px-4 py-3 flex items-center justify-between">
          <p class="text-sm font-bold text-gray-800 truncate">{{ cat.title }}</p>
          <span class="text-[10px] font-mono text-gray-300">{{ cat._id?.slice(-5) }}</span>
        </div>
      </div>
    </div>

    <!-- Count -->
    <p v-if="!isLoading && filtered.length > 0" class="text-xs text-gray-400 mt-4 text-right">
      {{ filtered.length }} {{ filtered.length === 1 ? 'category' : 'categories' }}
    </p>

    <!-- ── Create / Edit Modal ─────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-100" leave-to-class="opacity-0">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal" />

          <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100">
            <div v-if="showModal" class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
              <!-- Header -->
              <div class="flex items-center justify-between mb-5">
                <div>
                  <h2 class="text-lg font-black text-gray-900">{{ isEditing ? 'Edit Category' : 'Add Category' }}</h2>
                  <p class="text-xs text-gray-400 mt-0.5">{{ isEditing ? 'Update category details.' : 'Create a new venue category.' }}</p>
                </div>
                <button @click="closeModal" class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              <!-- Image preview -->
              <div class="mb-4 h-32 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                <img
                  v-if="imagePreview"
                  :src="imagePreview"
                  alt="Preview"
                  class="w-full h-full object-cover"
                  @error="(e: any) => e.target.style.display = 'none'"
                />
                <div v-else class="flex flex-col items-center gap-2 text-gray-300">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <p class="text-xs">Image preview</p>
                </div>
              </div>

              <form @submit.prevent="submitForm" class="space-y-4">
                <!-- Title -->
                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category Title <span class="text-red-400">*</span></label>
                  <input
                    v-model="form.title"
                    type="text"
                    placeholder="e.g. Badminton"
                    class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                    autofocus
                  />
                </div>

                <!-- Image upload -->
                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Image <span v-if="!isEditing" class="text-red-400">*</span>
                    <span v-else class="text-gray-400 normal-case font-normal">(leave empty to keep current)</span>
                  </label>
                  <label class="flex items-center gap-3 w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 transition">
                    <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    <span class="truncate">{{ imageFile ? imageFile.name : 'Choose image…' }}</span>
                    <input type="file" accept="image/*" class="hidden" @change="onImageChange" />
                  </label>
                </div>

                <!-- Error -->
                <p v-if="formError" class="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{{ formError }}</p>

                <!-- Actions -->
                <div class="flex gap-3 pt-1">
                  <button type="button" @click="closeModal" class="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" :disabled="isSubmitting" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                    <svg v-if="isSubmitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                    {{ isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Category') }}
                  </button>
                </div>
              </form>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Delete Confirm Modal ────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-100" leave-to-class="opacity-0">
        <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="deleteTarget = null" />
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10 text-center">
            <!-- Category preview -->
            <div class="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4 bg-gray-100">
              <img :src="assetUrl(deleteTarget.image)" :alt="deleteTarget.title" class="w-full h-full object-cover" />
            </div>
            <h3 class="font-black text-gray-900 text-lg">Delete Category?</h3>
            <p class="text-sm text-gray-500 mt-1">
              <strong class="text-gray-800">{{ deleteTarget.title }}</strong> will be permanently removed.
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
