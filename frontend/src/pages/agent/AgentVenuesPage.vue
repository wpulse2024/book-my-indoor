<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { agentVenueApi, categoryApi, venueFeatureApi, assetUrl } from '@/services/api'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()

const venues = ref<any[]>([])
const categories = ref<any[]>([])
const venueFeatures = ref<any[]>([])
const loading = ref(false)
const showModal = ref(false)
const editingVenue = ref<any | null>(null)
const deleteTarget = ref<any | null>(null)
const saving = ref(false)
const deleting = ref(false)
const apiError = ref('')

// Location mode: 'maps' = paste Google Maps link, 'manual' = type lat/long
const locationMode = ref<'maps' | 'manual'>('maps')
const mapsUrl = ref('')
const mapsUrlError = ref('')

function parseGoogleMapsUrl(url: string): { lat: number; lng: number } | null {
  // Pattern 1: /@lat,lng  (standard share URLs and embed URLs)
  const atMatch = url.match(/@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/)
  if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) }

  // Pattern 2: ?q=lat,lng or &q=lat,lng
  const qMatch = url.match(/[?&]q=(-?\d{1,3}\.?\d*),(-?\d{1,3}\.?\d*)/)
  if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) }

  // Pattern 3: /place/.../lat,lng  (some share formats)
  const placeMatch = url.match(/\/(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/)
  if (placeMatch) return { lat: parseFloat(placeMatch[1]), lng: parseFloat(placeMatch[2]) }

  return null
}

function onMapsUrlInput() {
  mapsUrlError.value = ''
  const url = mapsUrl.value.trim()
  if (!url) return

  const coords = parseGoogleMapsUrl(url)
  if (coords) {
    form.value.locationLat = String(coords.lat)
    form.value.locationLong = String(coords.lng)
    mapsUrlError.value = ''
  } else {
    form.value.locationLat = ''
    form.value.locationLong = ''
    mapsUrlError.value = 'Could not extract coordinates. Try a full Google Maps URL (not a shortened link).'
  }
}

function setLocationMode(mode: 'maps' | 'manual') {
  locationMode.value = mode
  mapsUrlError.value = ''
  if (mode === 'manual') {
    mapsUrl.value = ''
  } else {
    // switching back to maps: clear coords so they must re-paste
    form.value.locationLat = ''
    form.value.locationLong = ''
  }
}

function defaultForm() {
  return {
    title: '',
    description: '',
    categoryId: '',
    locationTitle: '',
    locationLat: '',
    locationLong: '',
    features: [] as string[],
    slots: [] as { startTime: string; endTime: string; price: string }[],
    images: null as FileList | null,
  }
}

const form = ref(defaultForm())

const totalVenues = computed(() => venues.value.length)
const activeVenues = computed(() => venues.value.filter(v => (v.slots?.length ?? 0) > 0).length)

async function loadVenues() {
  loading.value = true
  apiError.value = ''
  try {
    const res = await agentVenueApi.list()
    venues.value = Array.isArray(res.data) ? res.data : []
  } catch (e: any) {
    apiError.value = e?.response?.data?.message ?? 'Failed to load venues'
  } finally {
    loading.value = false
  }
}

async function loadLookups() {
  try {
    const [catsRes, featsRes] = await Promise.all([categoryApi.list(), venueFeatureApi.list()])
    categories.value = Array.isArray(catsRes.data) ? catsRes.data : []
    venueFeatures.value = Array.isArray(featsRes.data) ? featsRes.data : []
  } catch {
    // non-critical
  }
}

onMounted(() => {
  loadVenues()
  loadLookups()
})

function resetSlotUI() {
  generator.value = { from: '06:00', to: '22:00', duration: 60, price: '' }
  generateError.value = ''
  showCustomAdd.value = false
  customSlot.value = { startTime: '', endTime: '', price: '' }
}

function openCreate() {
  editingVenue.value = null
  form.value = defaultForm()
  apiError.value = ''
  locationMode.value = 'maps'
  mapsUrl.value = ''
  mapsUrlError.value = ''
  resetSlotUI()
  showModal.value = true
}

function openEdit(venue: any) {
  editingVenue.value = venue
  apiError.value = ''
  locationMode.value = 'manual'
  mapsUrl.value = ''
  mapsUrlError.value = ''
  resetSlotUI()
  form.value = {
    title: venue.title ?? '',
    description: venue.description ?? '',
    categoryId: venue.categoryId?._id ?? venue.categoryId ?? '',
    locationTitle: venue.location?.title ?? '',
    locationLat: String(venue.location?.lat ?? ''),
    locationLong: String(venue.location?.long ?? ''),
    features: (venue.features ?? []).map((f: any) => (typeof f === 'string' ? f : f._id ?? '')),
    slots: (venue.slots ?? []).map((s: any) => ({
      startTime: s.startTime ?? '',
      endTime: s.endTime ?? '',
      price: String(s.price ?? ''),
    })),
    images: null,
  }
  showModal.value = true
}

async function saveVenue() {
  saving.value = true
  apiError.value = ''
  try {
    const fd = new FormData()
    fd.append('title', form.value.title.trim())
    if (form.value.description.trim()) fd.append('description', form.value.description.trim())
    fd.append('categoryId', form.value.categoryId)
    fd.append('location', JSON.stringify({
      title: form.value.locationTitle,
      lat: parseFloat(form.value.locationLat) || 0,
      long: parseFloat(form.value.locationLong) || 0,
    }))
    if (form.value.features.length) {
      fd.append('features', JSON.stringify(form.value.features))
    }
    if (form.value.slots.length) {
      fd.append('slots', JSON.stringify(form.value.slots.map(s => ({
        startTime: s.startTime,
        endTime: s.endTime,
        price: parseFloat(s.price) || 0,
      }))))
    }
    if (form.value.images) {
      Array.from(form.value.images).forEach(f => fd.append('images', f))
    }

    if (editingVenue.value) {
      await agentVenueApi.update(editingVenue.value._id, fd)
    } else {
      await agentVenueApi.create(fd)
    }

    showModal.value = false
    await loadVenues()
  } catch (e: any) {
    apiError.value = e?.response?.data?.message ?? 'Failed to save venue'
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await agentVenueApi.remove(deleteTarget.value._id)
    deleteTarget.value = null
    await loadVenues()
  } catch (e: any) {
    apiError.value = e?.response?.data?.message ?? 'Failed to delete venue'
    deleteTarget.value = null
  } finally {
    deleting.value = false
  }
}

function toggleFeature(id: string) {
  const idx = form.value.features.indexOf(id)
  if (idx === -1) form.value.features.push(id)
  else form.value.features.splice(idx, 1)
}

// ── Slot generator ──────────────────────────────────────────────────────────
const DURATION_OPTIONS = [
  { label: '30 min', value: 30 },
  { label: '1 hr',   value: 60 },
  { label: '1.5 hr', value: 90 },
  { label: '2 hr',   value: 120 },
  { label: '3 hr',   value: 180 },
]

const generator = ref({ from: '06:00', to: '22:00', duration: 60, price: '' })
const showCustomAdd = ref(false)
const customSlot = ref({ startTime: '', endTime: '', price: '' })
const generateError = ref('')

function minsToTime(mins: number): string {
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
}

function formatTime(t: string): string {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

function generateSlots() {
  generateError.value = ''
  const [fh, fm] = generator.value.from.split(':').map(Number)
  const [th, tm] = generator.value.to.split(':').map(Number)
  const fromMins = fh * 60 + fm
  const toMins   = th * 60 + tm
  const dur      = generator.value.duration

  if (toMins <= fromMins) {
    generateError.value = '"To" time must be after "From" time.'
    return
  }
  if (toMins - fromMins < dur) {
    generateError.value = 'Time range is shorter than the selected duration.'
    return
  }

  const generated: typeof form.value.slots = []
  for (let start = fromMins; start + dur <= toMins; start += dur) {
    generated.push({
      startTime: minsToTime(start),
      endTime:   minsToTime(start + dur),
      price:     generator.value.price,
    })
  }
  form.value.slots = generated
}

function addCustomSlot() {
  if (!customSlot.value.startTime || !customSlot.value.endTime) return
  form.value.slots.push({ ...customSlot.value })
  customSlot.value = { startTime: '', endTime: '', price: '' }
  showCustomAdd.value = false
}

function removeSlot(i: number) {
  form.value.slots.splice(i, 1)
}

function onImagesChange(e: Event) {
  form.value.images = (e.target as HTMLInputElement).files
}

function venueCover(venue: any): string {
  return venue.images?.[0] ? assetUrl(venue.images[0]) : ''
}

function venueIsActive(venue: any): boolean {
  return (venue.slots?.length ?? 0) > 0
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4">
    <!-- Breadcrumb -->
    <nav class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
      <span>Admin</span>
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
      <span class="text-indigo-600">Venues</span>
    </nav>

    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-3xl font-black text-gray-900">My Venues</h1>
        <p class="text-gray-500 text-sm mt-1 max-w-lg">Manage your indoor sports facilities, monitor active status, and optimize court availability across all locations.</p>
      </div>
      <button
        v-if="!auth.isManager"
        @click="openCreate"
        class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
        Add New Venue
      </button>
    </div>

    <!-- Stats bar -->
    <div class="grid grid-cols-4 gap-px bg-gray-100 rounded-2xl overflow-hidden mb-6 border border-gray-100">
      <div class="bg-white px-6 py-5">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Venues</p>
        <p class="text-4xl font-black text-gray-900 mt-1 leading-none">{{ String(totalVenues).padStart(2, '0') }}</p>
      </div>
      <div class="bg-white px-6 py-5 border-l border-indigo-100">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Now</p>
        <p class="text-4xl font-black text-indigo-600 mt-1 leading-none">{{ String(activeVenues).padStart(2, '0') }}</p>
      </div>
      <div class="bg-white px-6 py-5">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg. Utilization</p>
        <p class="text-4xl font-black text-gray-900 mt-1 leading-none">—</p>
      </div>
      <div class="bg-white px-6 py-5">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reports (24H)</p>
        <p class="text-4xl font-black text-gray-900 mt-1 leading-none">—</p>
      </div>
    </div>

    <!-- Global error -->
    <div v-if="apiError && !showModal && !deleteTarget" class="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
      {{ apiError }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <svg class="w-8 h-8 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>

    <!-- Venue grid -->
    <div v-else class="grid grid-cols-3 gap-5 mb-8">
      <!-- Venue cards -->
      <div
        v-for="venue in venues"
        :key="venue._id"
        class="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
      >
        <!-- Cover image -->
        <div class="relative h-44 bg-gray-200 overflow-hidden">
          <img
            v-if="venueCover(venue)"
            :src="venueCover(venue)"
            :alt="venue.title"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full bg-gradient-to-br from-indigo-900 to-indigo-700 flex items-center justify-center">
            <svg class="w-14 h-14 text-indigo-400/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <!-- Status badge -->
          <span
            class="absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
            :class="venueIsActive(venue) ? 'bg-green-500 text-white' : 'bg-gray-900/60 text-gray-300'"
          >
            {{ venueIsActive(venue) ? 'Active' : 'Inactive' }}
          </span>
          <!-- Location overlay -->
          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2.5">
            <p class="text-white text-xs font-semibold flex items-center gap-1 truncate">
              <svg class="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              {{ venue.location?.title ?? '—' }}
            </p>
          </div>
        </div>

        <!-- Card body -->
        <div class="p-4">
          <div class="flex items-start justify-between mb-3">
            <h3 class="font-black text-gray-900 text-[15px] leading-snug">{{ venue.title }}</h3>
            <span v-if="venue.rating" class="text-xs font-bold text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 ml-2 flex-shrink-0">
              {{ venue.rating }}
            </span>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-2 mb-4">
            <div class="bg-gray-50 rounded-xl p-3">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Slots</p>
              <p class="text-xl font-black text-gray-900 mt-0.5 leading-none">{{ venue.slots?.length ?? 0 }}</p>
              <p class="text-[10px] text-gray-500 font-medium mt-0.5 truncate">{{ venue.categoryId?.name ?? '—' }}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-3">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Today's Rev.</p>
              <p class="text-xl font-black text-gray-900 mt-0.5 leading-none">$0.00</p>
              <p class="text-[10px] text-gray-500 font-medium mt-0.5">No bookings</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <template v-if="!auth.isManager">
            <button
              @click="openEdit(venue)"
              class="flex-1 text-xs font-bold text-gray-700 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 py-2 rounded-xl transition-colors"
            >
              Edit Venue
            </button>
            <button
              @click="deleteTarget = venue"
              class="p-2 text-red-400 border border-red-100 hover:bg-red-50 hover:border-red-300 rounded-xl transition-colors"
              title="Delete venue"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
            </template>
            <button
              class="flex-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl transition-colors"
            >
              Manage Slots
            </button>
          </div>
        </div>
      </div>

      <!-- Add new venue card -->
      <button
        v-if="!auth.isManager"
        @click="openCreate"
        class="border-2 border-dashed border-gray-200 hover:border-indigo-300 rounded-2xl flex flex-col items-center justify-center gap-3 p-8 text-center transition-all group min-h-[300px]"
      >
        <div class="w-14 h-14 bg-gray-100 group-hover:bg-indigo-50 rounded-full flex items-center justify-center transition-colors">
          <svg class="w-6 h-6 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
          </svg>
        </div>
        <div>
          <p class="font-black text-gray-700 group-hover:text-indigo-700 transition-colors">Expanding your empire?</p>
          <p class="text-xs text-gray-400 mt-1.5 leading-relaxed">List your new turf, court, or<br>sports hall in minutes.</p>
        </div>
        <span class="text-xs font-bold text-indigo-500 group-hover:text-indigo-700 transition-colors">Start setup process</span>
      </button>
    </div>

    <!-- ── Create / Edit Modal ───────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="!saving && (showModal = false)" />

        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-black text-gray-900">
              {{ editingVenue ? 'Edit Venue' : 'Add New Venue' }}
            </h2>
            <button
              @click="showModal = false"
              :disabled="saving"
              class="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Error -->
          <div v-if="apiError" class="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-sm">
            {{ apiError }}
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <!-- Title -->
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Venue Name *</label>
              <input
                v-model="form.title"
                type="text"
                placeholder="e.g. Green Valley Futsal"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Description</label>
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="Describe your venue..."
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition resize-none"
              />
            </div>

            <!-- Category -->
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Category *</label>
              <select
                v-model="form.categoryId"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition bg-white cursor-pointer"
              >
                <option value="" disabled>Select a category</option>
                <option v-for="cat in categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
              </select>
            </div>

            <!-- Location -->
            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location *</label>

              <!-- Address text (always shown) -->
              <input
                v-model="form.locationTitle"
                type="text"
                placeholder="Venue address (e.g. 123 Main St, San Francisco, CA)"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              />

              <!-- Coordinates source toggle -->
              <div class="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                <button
                  type="button"
                  @click="setLocationMode('maps')"
                  class="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                  :class="locationMode === 'maps' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                >
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Google Maps Link
                </button>
                <button
                  type="button"
                  @click="setLocationMode('manual')"
                  class="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                  :class="locationMode === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Enter Manually
                </button>
              </div>

              <!-- Google Maps link paste -->
              <div v-if="locationMode === 'maps'">
                <div class="relative">
                  <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                  </svg>
                  <input
                    v-model="mapsUrl"
                    @input="onMapsUrlInput"
                    @paste.prevent="(e) => { mapsUrl = (e.clipboardData?.getData('text') ?? '').trim(); onMapsUrlInput() }"
                    type="url"
                    placeholder="Paste Google Maps link here..."
                    class="w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 outline-none transition"
                    :class="mapsUrlError ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30' : 'border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'"
                  />
                </div>
                <p v-if="mapsUrlError" class="text-xs text-red-500 mt-1.5 flex items-start gap-1">
                  <svg class="w-3.5 h-3.5 flex-shrink-0 mt-px" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  {{ mapsUrlError }}
                </p>
                <p class="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                  Open Google Maps → right-click a location → copy link, then paste it above.
                  Shortened links (maps.app.goo.gl) are not supported — use the full URL.
                </p>
              </div>

              <!-- Manual lat/long -->
              <div v-else class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 mb-1">Latitude</label>
                  <input
                    v-model="form.locationLat"
                    type="number"
                    step="any"
                    placeholder="e.g. 37.7749"
                    class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 mb-1">Longitude</label>
                  <input
                    v-model="form.locationLong"
                    type="number"
                    step="any"
                    placeholder="e.g. -122.4194"
                    class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                  />
                </div>
              </div>

              <!-- Coordinates preview badge (shown when coords are set) -->
              <div
                v-if="form.locationLat && form.locationLong"
                class="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2"
              >
                <svg class="w-3.5 h-3.5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/><path d="M9 16.5v-9l6 4.5z" fill="none"/><path fill-rule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                <svg class="w-3.5 h-3.5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                <span class="text-xs font-bold text-green-700">Coordinates set:</span>
                <code class="text-xs text-green-800 font-mono">{{ form.locationLat }}, {{ form.locationLong }}</code>
              </div>
            </div>

            <!-- Features -->
            <div v-if="venueFeatures.length">
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Features</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="feat in venueFeatures"
                  :key="feat._id"
                  type="button"
                  @click="toggleFeature(feat._id)"
                  class="text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors"
                  :class="form.features.includes(feat._id)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'"
                >
                  {{ feat.name }}
                </button>
              </div>
            </div>

            <!-- Slots -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time Slots</label>
                <span v-if="form.slots.length" class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {{ form.slots.length }} slot{{ form.slots.length !== 1 ? 's' : '' }}
                </span>
              </div>

              <!-- Quick generator panel -->
              <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <p class="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  Quick Generate
                </p>

                <!-- Duration pills -->
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="opt in DURATION_OPTIONS"
                    :key="opt.value"
                    type="button"
                    @click="generator.duration = opt.value"
                    class="text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors"
                    :class="generator.duration === opt.value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'"
                  >
                    {{ opt.label }}
                  </button>
                </div>

                <!-- From / To / Price -->
                <div class="grid grid-cols-3 gap-2">
                  <div>
                    <label class="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Day starts</label>
                    <input
                      v-model="generator.from"
                      type="time"
                      class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white"
                    />
                  </div>
                  <div>
                    <label class="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Day ends</label>
                    <input
                      v-model="generator.to"
                      type="time"
                      class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white"
                    />
                  </div>
                  <div>
                    <label class="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Price per slot ($)</label>
                    <input
                      v-model="generator.price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white"
                    />
                  </div>
                </div>

                <p v-if="generateError" class="text-xs text-red-500">{{ generateError }}</p>

                <button
                  type="button"
                  @click="generateSlots"
                  class="w-full py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  Generate Slots
                  <span v-if="generator.from && generator.to && generator.duration" class="opacity-70">
                    ({{ Math.floor((generator.to.split(':').reduce((a,b,i) => a + Number(b)*(i===0?60:1), 0) - generator.from.split(':').reduce((a,b,i) => a + Number(b)*(i===0?60:1), 0)) / generator.duration) }} slots)
                  </span>
                </button>
              </div>

              <!-- Slot chips -->
              <div v-if="form.slots.length" class="flex flex-wrap gap-2">
                <div
                  v-for="(slot, i) in form.slots"
                  :key="i"
                  class="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 group"
                >
                  <svg class="w-3 h-3 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span class="text-xs font-bold text-gray-700 whitespace-nowrap">
                    {{ formatTime(slot.startTime) }} – {{ formatTime(slot.endTime) }}
                  </span>
                  <span class="flex items-center bg-indigo-50 rounded px-1.5 py-0.5">
                    <span class="text-[10px] font-bold text-indigo-400">$</span>
                    <input
                      v-model="slot.price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      class="w-10 text-[10px] font-bold text-indigo-600 bg-transparent outline-none border-0 p-0 ml-0.5"
                    />
                  </span>
                  <button
                    type="button"
                    @click="removeSlot(i)"
                    class="ml-0.5 w-4 h-4 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors rounded"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Add custom slot toggle -->
              <div>
                <button
                  type="button"
                  @click="showCustomAdd = !showCustomAdd"
                  class="text-xs font-bold text-gray-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                >
                  <svg class="w-3.5 h-3.5 transition-transform" :class="showCustomAdd ? 'rotate-45' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
                  </svg>
                  Add a custom slot
                </button>

                <Transition name="slide">
                  <div v-if="showCustomAdd" class="mt-2 flex items-end gap-2 bg-gray-50 rounded-xl p-3">
                    <div class="flex-1">
                      <label class="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Start</label>
                      <input v-model="customSlot.startTime" type="time" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white"/>
                    </div>
                    <div class="flex-1">
                      <label class="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">End</label>
                      <input v-model="customSlot.endTime" type="time" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white"/>
                    </div>
                    <div class="w-24">
                      <label class="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Price ($)</label>
                      <input v-model="customSlot.price" type="number" min="0" step="0.01" placeholder="0.00" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white"/>
                    </div>
                    <button
                      type="button"
                      @click="addCustomSlot"
                      :disabled="!customSlot.startTime || !customSlot.endTime"
                      class="px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-lg transition-colors flex-shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </Transition>
              </div>
            </div>

            <!-- Images -->
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Images (up to 10){{ editingVenue ? ' — leave empty to keep existing' : '' }}
              </label>
              <label class="flex items-center gap-4 border-2 border-dashed border-gray-200 hover:border-indigo-300 rounded-xl p-4 cursor-pointer transition-colors group">
                <svg class="w-9 h-9 text-gray-300 group-hover:text-indigo-300 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <div>
                  <p class="text-sm font-semibold text-gray-600 group-hover:text-indigo-600 transition-colors">Click to upload images</p>
                  <p class="text-xs text-gray-400 mt-0.5">
                    {{ form.images?.length ? `${form.images.length} file(s) selected` : 'PNG, JPG — up to 10MB each' }}
                  </p>
                </div>
                <input type="file" accept="image/*" multiple class="hidden" @change="onImagesChange" />
              </label>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <button
              @click="showModal = false"
              :disabled="saving"
              class="px-5 py-2.5 text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              @click="saveVenue"
              :disabled="saving || !form.title.trim() || !form.categoryId || !form.locationTitle.trim()"
              class="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2"
            >
              <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ editingVenue ? 'Save Changes' : 'Create Venue' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Delete Confirmation ─────────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="!deleting && (deleteTarget = null)" />
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </div>
            <div>
              <h3 class="font-black text-gray-900">Delete Venue</h3>
              <p class="text-xs text-gray-400 mt-0.5">This action cannot be undone.</p>
            </div>
          </div>
          <p class="text-sm text-gray-600 mb-6 leading-relaxed">
            Are you sure you want to delete <span class="font-bold text-gray-900">{{ deleteTarget?.title }}</span>?
            All associated slots and data will be permanently removed.
          </p>
          <div class="flex gap-3">
            <button
              @click="deleteTarget = null"
              :disabled="deleting"
              class="flex-1 py-2.5 text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              @click="confirmDelete"
              :disabled="deleting"
              class="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg v-if="deleting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Delete Venue
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.15s ease;
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}
.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 120px;
}
</style>
