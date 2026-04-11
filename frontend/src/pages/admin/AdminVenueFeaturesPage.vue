<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { venueFeatureApi } from '@/services/api'
import axios from 'axios'

// ── Emoji options ──────────────────────────────────────────────────────────
const emojiGroups = [
  {
    label: 'Sports & Activities',
    items: [
      { emoji: '🏸', label: 'Badminton' },
      { emoji: '⚽', label: 'Football / Futsal' },
      { emoji: '🏀', label: 'Basketball' },
      { emoji: '🎾', label: 'Tennis' },
      { emoji: '🏐', label: 'Volleyball' },
      { emoji: '🏊', label: 'Swimming' },
      { emoji: '🥊', label: 'Boxing' },
      { emoji: '🏋️', label: 'Gym / Weights' },
      { emoji: '🧘', label: 'Yoga / Meditation' },
      { emoji: '🎱', label: 'Billiards / Snooker' },
      { emoji: '🏓', label: 'Table Tennis' },
      { emoji: '🥋', label: 'Martial Arts' },
      { emoji: '🎯', label: 'Archery' },
      { emoji: '🧗', label: 'Climbing Wall' },
      { emoji: '🛹', label: 'Skateboarding' },
      { emoji: '🏑', label: 'Hockey' },
      { emoji: '🥅', label: 'Goal / Net' },
      { emoji: '🎽', label: 'Sports Kit' },
    ],
  },
  {
    label: 'Facilities',
    items: [
      { emoji: '🅿️', label: 'Parking' },
      { emoji: '📶', label: 'WiFi' },
      { emoji: '🚿', label: 'Shower' },
      { emoji: '🔒', label: 'Locker' },
      { emoji: '❄️', label: 'Air Conditioning' },
      { emoji: '💧', label: 'Drinking Water' },
      { emoji: '🍽️', label: 'Cafeteria / Canteen' },
      { emoji: '☕', label: 'Café' },
      { emoji: '🚻', label: 'Restroom / Toilet' },
      { emoji: '♿', label: 'Wheelchair Access' },
      { emoji: '💡', label: 'Floodlights / Lighting' },
      { emoji: '📹', label: 'CCTV / Security' },
      { emoji: '🏥', label: 'First Aid / Medical' },
      { emoji: '🪑', label: 'Spectator Seating' },
      { emoji: '🌡️', label: 'Heating' },
      { emoji: '🔊', label: 'Sound System' },
      { emoji: '📺', label: 'Scoreboard / Display' },
      { emoji: '⚡', label: 'Power Backup' },
      { emoji: '🚗', label: 'Valet Parking' },
      { emoji: '🚌', label: 'Shuttle / Transport' },
      { emoji: '💳', label: 'Card Payment' },
      { emoji: '🎒', label: 'Equipment Rental' },
      { emoji: '🧹', label: 'Cleaning Service' },
      { emoji: '🛡️', label: 'Security Guard' },
      { emoji: '🌿', label: 'Garden / Outdoor Area' },
      { emoji: '🎪', label: 'Events Space' },
      { emoji: '🏆', label: 'Trophy / Awards' },
      { emoji: '📦', label: 'Storage' },
    ],
  },
]

// ── State ──────────────────────────────────────────────────────────────────
const features = ref<any[]>([])
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

const form = ref({ name: '', icon: '' })

// Emoji picker
const showEmojiPicker = ref(false)
const emojiPickerRef = ref<HTMLElement | null>(null)

function selectEmoji(emoji: string) {
  form.value.icon = emoji
  showEmojiPicker.value = false
}

function onDocClick(e: MouseEvent) {
  if (emojiPickerRef.value && !emojiPickerRef.value.contains(e.target as Node)) {
    showEmojiPicker.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onDocClick))
onUnmounted(() => document.removeEventListener('mousedown', onDocClick))

// ── Computed ───────────────────────────────────────────────────────────────
const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return features.value
  return features.value.filter(f => f.name?.toLowerCase().includes(q))
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
  form.value = { name: '', icon: '' }
  formError.value = ''
  showEmojiPicker.value = false
  showModal.value = true
}

function openEdit(feature: any) {
  isEditing.value = true
  editTarget.value = feature
  form.value = { name: feature.name, icon: feature.icon }
  formError.value = ''
  showEmojiPicker.value = false
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  showEmojiPicker.value = false
  formError.value = ''
}

// ── API Methods ────────────────────────────────────────────────────────────
async function loadFeatures() {
  isLoading.value = true
  error.value = ''
  try {
    const res = await venueFeatureApi.list()
    features.value = res.data
  } catch (e) {
    error.value = getMsg(e, 'Failed to load venue features.')
  } finally {
    isLoading.value = false
  }
}

async function submitForm() {
  formError.value = ''
  if (!form.value.name.trim()) { formError.value = 'Name is required.'; return }
  if (!form.value.icon.trim()) { formError.value = 'Icon is required.'; return }

  isSubmitting.value = true
  try {
    if (isEditing.value && editTarget.value) {
      const res = await venueFeatureApi.update(editTarget.value._id, {
        name: form.value.name.trim(),
        icon: form.value.icon.trim(),
      })
      const idx = features.value.findIndex(f => f._id === editTarget.value._id)
      if (idx !== -1) features.value[idx] = res.data
    } else {
      const res = await venueFeatureApi.create({
        name: form.value.name.trim(),
        icon: form.value.icon.trim(),
      })
      features.value.push(res.data)
    }
    closeModal()
  } catch (e) {
    formError.value = getMsg(e, 'Failed to save venue feature.')
  } finally {
    isSubmitting.value = false
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  isDeleting.value = true
  try {
    await venueFeatureApi.remove(deleteTarget.value._id)
    features.value = features.value.filter(f => f._id !== deleteTarget.value._id)
    deleteTarget.value = null
  } catch (e) {
    error.value = getMsg(e, 'Failed to delete venue feature.')
  } finally {
    isDeleting.value = false
  }
}

onMounted(loadFeatures)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-2xl font-black text-gray-900">Venue Features</h1>
        <p class="text-gray-500 text-sm mt-1">Manage amenities and features that can be assigned to venues.</p>
      </div>
      <button
        @click="openCreate"
        class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
        </svg>
        Add Feature
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
        placeholder="Search features..."
        class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
      />
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{{ error }}</div>

    <!-- Loading -->
    <div v-if="isLoading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      <div v-for="i in 10" :key="i" class="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
        <div class="w-10 h-10 bg-gray-100 rounded-xl mb-3" />
        <div class="h-3.5 bg-gray-100 rounded-lg w-3/4" />
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="filtered.length === 0 && !isLoading" class="bg-white rounded-2xl border border-gray-100 py-16 text-center">
      <div class="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
        </svg>
      </div>
      <p class="font-bold text-gray-700">No venue features yet</p>
      <p class="text-sm text-gray-400 mt-1 mb-5">Add your first feature to assign it to venues.</p>
      <button @click="openCreate" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors">
        Add Feature
      </button>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      <div
        v-for="feature in filtered"
        :key="feature._id"
        class="bg-white rounded-2xl border border-gray-100 p-4 group hover:shadow-md hover:border-indigo-100 transition-all"
      >
        <div class="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center mb-3 text-xl">
          {{ feature.icon }}
        </div>
        <p class="text-sm font-bold text-gray-800 truncate mb-3">{{ feature.name }}</p>
        <div class="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            @click="openEdit(feature)"
            class="flex-1 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >Edit</button>
          <button
            @click="deleteTarget = feature"
            class="w-8 h-7 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Count -->
    <p v-if="!isLoading && filtered.length > 0" class="text-xs text-gray-400 mt-4 text-right">
      {{ filtered.length }} {{ filtered.length === 1 ? 'feature' : 'features' }}
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
                  <h2 class="text-lg font-black text-gray-900">{{ isEditing ? 'Edit Feature' : 'Add Feature' }}</h2>
                  <p class="text-xs text-gray-400 mt-0.5">{{ isEditing ? 'Update feature details.' : 'Create a new venue feature.' }}</p>
                </div>
                <button @click="closeModal" class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              <!-- Icon preview -->
              <div class="mb-5 flex items-center justify-center">
                <div class="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-4xl border-2 border-dashed border-indigo-200">
                  {{ form.icon || '?' }}
                </div>
              </div>

              <form @submit.prevent="submitForm" class="space-y-4">
                <!-- Name -->
                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Feature Name <span class="text-red-400">*</span></label>
                  <input
                    v-model="form.name"
                    type="text"
                    placeholder="e.g. Parking, WiFi, Changing Room"
                    class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                    autofocus
                  />
                </div>

                <!-- Icon picker -->
                <div ref="emojiPickerRef">
                  <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Icon <span class="text-red-400">*</span></label>

                  <!-- Trigger button -->
                  <button
                    type="button"
                    @click="showEmojiPicker = !showEmojiPicker"
                    class="w-full flex items-center gap-3 px-3.5 py-2.5 border rounded-xl text-sm transition text-left"
                    :class="showEmojiPicker ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-gray-200 hover:border-indigo-300'"
                  >
                    <span class="text-xl leading-none">{{ form.icon || '🔍' }}</span>
                    <span :class="form.icon ? 'text-gray-700' : 'text-gray-400'">
                      {{ form.icon
                        ? (emojiGroups.flatMap(g => g.items).find(e => e.emoji === form.icon)?.label ?? form.icon)
                        : 'Choose an icon…' }}
                    </span>
                    <svg class="w-4 h-4 text-gray-400 ml-auto transition-transform" :class="{ 'rotate-180': showEmojiPicker }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>

                  <!-- Dropdown panel -->
                  <Transition
                    enter-active-class="transition duration-100 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition duration-75"
                    leave-to-class="opacity-0"
                  >
                    <div
                      v-if="showEmojiPicker"
                      class="mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto z-20 relative"
                    >
                      <div v-for="group in emojiGroups" :key="group.label" class="p-3">
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{{ group.label }}</p>
                        <div class="grid grid-cols-7 gap-1">
                          <button
                            v-for="item in group.items"
                            :key="item.emoji"
                            type="button"
                            :title="item.label"
                            @click="selectEmoji(item.emoji)"
                            class="w-8 h-8 flex items-center justify-center text-lg rounded-lg transition-colors hover:bg-indigo-50"
                            :class="form.icon === item.emoji ? 'bg-indigo-100 ring-2 ring-indigo-400' : ''"
                          >
                            {{ item.emoji }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Transition>
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
                    {{ isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Feature') }}
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
            <div class="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4">
              {{ deleteTarget.icon }}
            </div>
            <h3 class="font-black text-gray-900 text-lg">Delete Feature?</h3>
            <p class="text-sm text-gray-500 mt-1">
              <strong class="text-gray-800">{{ deleteTarget.name }}</strong> will be permanently removed.
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
