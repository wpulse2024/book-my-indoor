<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { agentVenueApi, agentSlotApi } from '@/services/api'

const route = useRoute()
const router = useRouter()

// ── State ─────────────────────────────────────────────────────────────────────
const venues = ref<any[]>([])
const slots = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const booking = ref(false)
const apiError = ref('')

// ── Pagination ────────────────────────────────────────────────────────────────
const currentPage = ref(1)
const pageSize = ref(20)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

// ── Filters ───────────────────────────────────────────────────────────────────
const filterVenueId = ref((route.query.venueId as string) || '')
const filterDate = ref('')
const filterStatus = ref('')

// ── Row selection ─────────────────────────────────────────────────────────────
const selectedIds = ref<Set<string>>(new Set())

// Selectable = any slot that is not booked
const selectableSlots = computed(() => slots.value.filter(s => s.bookingStatus !== 'booked'))
const draftSlotsList = computed(() => slots.value.filter(s => s.status === 'draft'))

const selectAll = computed({
  get: () => selectableSlots.value.length > 0 && selectableSlots.value.every(s => selectedIds.value.has(s._id)),
  set: (val: boolean) => {
    const next = new Set(selectedIds.value)
    if (val) selectableSlots.value.forEach(s => next.add(s._id))
    else next.clear()
    selectedIds.value = next
  },
})

const selectedDraftIds = computed(() => [...selectedIds.value].filter(id => draftSlotsList.value.some(s => s._id === id)))
// For publish: draft + unpublish slots in selection
const selectedPublishableIds = computed(() =>
  [...selectedIds.value].filter(id => {
    const s = slots.value.find(x => x._id === id)
    return s && (s.status === 'draft' || s.status === 'unpublish')
  })
)
// For unpublish: draft + publish slots in selection (not booked)
const selectedUnpublishableIds = computed(() =>
  [...selectedIds.value].filter(id => {
    const s = slots.value.find(x => x._id === id)
    return s && (s.status === 'draft' || s.status === 'publish') && s.bookingStatus !== 'booked'
  })
)

function toggleRow(id: string) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

// ── Modals ────────────────────────────────────────────────────────────────────
const showCreateModal = ref(false)
const showBulkModal = ref(false)
const showBookModal = ref(false)
const showEditModal = ref(false)
const showBulkUpdateModal = ref(false)
const showBulkDeleteConfirm = ref(false)
const bulkStatusAction = ref<'publish' | 'unpublish' | null>(null)
const deleteTarget = ref<any>(null)
const bookingSlot = ref<any>(null)
const editTarget = ref<any>(null)

// ── Forms ─────────────────────────────────────────────────────────────────────
const createForm = ref({ venueId: '', date: '', startTime: '', endTime: '', slotPrice: '' })
const bulkForm = ref({ venueId: '', startDate: '', endDate: '', slotPrice: '' })
const bookForm = ref({ userPhone: '' })
const editForm = ref({ slotPrice: '' })
const bulkUpdateForm = ref({ slotPrice: '' })

// ── Computed stats (from current page) ───────────────────────────────────────
const totalSlots = computed(() => total.value)
const publishedSlots = computed(() => slots.value.filter(s => s.status === 'publish').length)
const bookedSlots = computed(() => slots.value.filter(s => s.bookingStatus === 'booked').length)
const draftSlotsCount = computed(() => slots.value.filter(s => s.status === 'draft').length)

const selectedVenueName = computed(() => {
  if (!filterVenueId.value) return 'All Venues'
  return venues.value.find(v => v._id === filterVenueId.value)?.title ?? 'All Venues'
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    draft:     { label: 'Draft',       cls: 'bg-gray-100 text-gray-600' },
    publish:   { label: 'Published',   cls: 'bg-green-100 text-green-700' },
    unpublish: { label: 'Unpublished', cls: 'bg-yellow-100 text-yellow-700' },
  }
  return map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' }
}

function bookingBadge(status: string | undefined) {
  if (!status) return { label: 'Available', cls: 'bg-emerald-100 text-emerald-700' }
  const map: Record<string, { label: string; cls: string }> = {
    booked:    { label: 'Booked',    cls: 'bg-blue-100 text-blue-700' },
    cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-700' },
    rejected:  { label: 'Rejected',  cls: 'bg-red-100 text-red-700' },
  }
  return map[status] ?? { label: 'Available', cls: 'bg-emerald-100 text-emerald-700' }
}

function paymentBadge(status: string | undefined) {
  if (!status) return null
  const map: Record<string, { label: string; cls: string }> = {
    pending_for_payment: { label: 'Pending Payment', cls: 'bg-orange-100 text-orange-700' },
    payment_done:        { label: 'Paid',            cls: 'bg-green-100 text-green-700' },
    payment_verified:    { label: 'Verified',        cls: 'bg-teal-100 text-teal-700' },
    payment_rejected:    { label: 'Payment Rejected',cls: 'bg-red-100 text-red-700' },
  }
  return map[status] ?? null
}

function formatTime(t: string) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

function formatDate(d: string | Date) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function venueName(slot: any) {
  return slot.venueId?.title ?? venues.value.find(v => v._id === (slot.venueId?._id ?? slot.venueId))?.title ?? '—'
}

// ── Data loading ──────────────────────────────────────────────────────────────
async function loadVenues() {
  try {
    const res = await agentVenueApi.list()
    venues.value = Array.isArray(res.data) ? res.data : []
  } catch {}
}

async function loadSlots() {
  loading.value = true
  apiError.value = ''
  selectedIds.value = new Set()
  try {
    const query: Record<string, any> = { page: currentPage.value, limit: pageSize.value }
    if (filterVenueId.value) query.venueId = filterVenueId.value
    if (filterDate.value) query.date = filterDate.value
    if (filterStatus.value) query.status = filterStatus.value
    const res = await agentSlotApi.list(query)
    const data = res.data
    if (data?.data && Array.isArray(data.data)) {
      slots.value = data.data
      total.value = data.total ?? data.data.length
    } else {
      slots.value = Array.isArray(data) ? data : (data?.slots ?? [])
      total.value = slots.value.length
    }
  } catch (e: any) {
    apiError.value = e?.response?.data?.message ?? 'Failed to load slots'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadVenues()
  await loadSlots()
})

watch([filterVenueId, filterDate, filterStatus], () => {
  currentPage.value = 1
  loadSlots()
})

watch(currentPage, () => loadSlots())

watch(pageSize, () => {
  currentPage.value = 1
  loadSlots()
})

watch(filterVenueId, (val) => {
  router.replace({ query: val ? { venueId: val } : {} })
})

// ── Pagination helpers ────────────────────────────────────────────────────────
function goToPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
}

const pageNumbers = computed(() => {
  const pages: (number | '...')[] = []
  const total = totalPages.value
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage.value > 3) pages.push('...')
    for (let i = Math.max(2, currentPage.value - 1); i <= Math.min(total - 1, currentPage.value + 1); i++) pages.push(i)
    if (currentPage.value < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
})

// ── Create single slot ────────────────────────────────────────────────────────
function openCreate() {
  createForm.value = {
    venueId: filterVenueId.value || (venues.value[0]?._id ?? ''),
    date: filterDate.value || '',
    startTime: '',
    endTime: '',
    slotPrice: '',
  }
  apiError.value = ''
  showCreateModal.value = true
}

async function saveSlot() {
  const { venueId, date, startTime, endTime, slotPrice } = createForm.value
  if (!venueId || !date || !startTime || !endTime || !slotPrice) {
    apiError.value = 'All fields are required'
    return
  }
  saving.value = true
  apiError.value = ''
  try {
    await agentSlotApi.create({ venueId, date, startTime, endTime, slotPrice: parseFloat(slotPrice) })
    showCreateModal.value = false
    await loadSlots()
  } catch (e: any) {
    apiError.value = e?.response?.data?.message ?? 'Failed to create slot'
  } finally {
    saving.value = false
  }
}

// ── Bulk generate ─────────────────────────────────────────────────────────────
function openBulk() {
  bulkForm.value = {
    venueId: filterVenueId.value || (venues.value[0]?._id ?? ''),
    startDate: '',
    endDate: '',
    slotPrice: '',
  }
  apiError.value = ''
  showBulkModal.value = true
}

async function saveBulk() {
  const { venueId, startDate, endDate, slotPrice } = bulkForm.value
  if (!venueId || !startDate || !endDate) {
    apiError.value = 'Venue and date range are required'
    return
  }
  saving.value = true
  apiError.value = ''
  try {
    const payload: any = { venueId, startDate, endDate }
    if (slotPrice) payload.slotPrice = parseFloat(slotPrice)
    await agentSlotApi.createBulk(payload)
    showBulkModal.value = false
    await loadSlots()
  } catch (e: any) {
    apiError.value = e?.response?.data?.message ?? 'Failed to bulk generate slots'
  } finally {
    saving.value = false
  }
}

// ── Edit slot (draft only) ────────────────────────────────────────────────────
function openEdit(slot: any) {
  editTarget.value = slot
  editForm.value = { slotPrice: String(slot.slotPrice ?? '') }
  apiError.value = ''
  showEditModal.value = true
}

async function saveEdit() {
  if (!editForm.value.slotPrice) {
    apiError.value = 'Price is required'
    return
  }
  saving.value = true
  apiError.value = ''
  try {
    await agentSlotApi.updatePrice(editTarget.value._id, parseFloat(editForm.value.slotPrice))
    showEditModal.value = false
    editTarget.value = null
    await loadSlots()
  } catch (e: any) {
    apiError.value = e?.response?.data?.message ?? 'Failed to update slot'
  } finally {
    saving.value = false
  }
}

// ── Bulk update ───────────────────────────────────────────────────────────────
function openBulkUpdate() {
  bulkUpdateForm.value = { slotPrice: '' }
  apiError.value = ''
  showBulkUpdateModal.value = true
}

async function saveBulkUpdate() {
  if (!bulkUpdateForm.value.slotPrice) {
    apiError.value = 'Price is required'
    return
  }
  saving.value = true
  apiError.value = ''
  try {
    const res = await agentSlotApi.bulkUpdate({
      ids: selectedDraftIds.value,
      slotPrice: parseFloat(bulkUpdateForm.value.slotPrice),
    })
    showBulkUpdateModal.value = false
    selectedIds.value = new Set()
    await loadSlots()
    apiError.value = `Updated ${res.data?.modifiedCount ?? selectedDraftIds.value.length} slot(s).`
  } catch (e: any) {
    apiError.value = e?.response?.data?.message ?? 'Failed to bulk update'
  } finally {
    saving.value = false
  }
}

// ── Bulk publish / unpublish ──────────────────────────────────────────────────
async function confirmBulkStatus() {
  if (!bulkStatusAction.value) return
  const action = bulkStatusAction.value
  const ids = action === 'publish' ? selectedPublishableIds.value : selectedUnpublishableIds.value
  saving.value = true
  apiError.value = ''
  try {
    const res = await agentSlotApi.bulkUpdateStatus({ ids, status: action })
    bulkStatusAction.value = null
    selectedIds.value = new Set()
    await loadSlots()
    apiError.value = `${res.data?.modifiedCount ?? ids.length} slot(s) ${action === 'publish' ? 'published' : 'unpublished'}.`
  } catch (e: any) {
    apiError.value = e?.response?.data?.message ?? 'Failed to update status'
    bulkStatusAction.value = null
  } finally {
    saving.value = false
  }
}

// ── Bulk delete ───────────────────────────────────────────────────────────────
async function confirmBulkDelete() {
  deleting.value = true
  apiError.value = ''
  try {
    const res = await agentSlotApi.bulkDelete({ ids: selectedDraftIds.value })
    showBulkDeleteConfirm.value = false
    selectedIds.value = new Set()
    await loadSlots()
    apiError.value = `Deleted ${res.data?.deletedCount ?? selectedDraftIds.value.length} slot(s).`
  } catch (e: any) {
    apiError.value = e?.response?.data?.message ?? 'Failed to bulk delete'
    showBulkDeleteConfirm.value = false
  } finally {
    deleting.value = false
  }
}

// ── Status toggle ─────────────────────────────────────────────────────────────
async function toggleStatus(slot: any) {
  const next = slot.status === 'publish' ? 'unpublish' : 'publish'
  try {
    await agentSlotApi.updateStatus(slot._id, next)
    await loadSlots()
  } catch (e: any) {
    apiError.value = e?.response?.data?.message ?? 'Failed to update status'
  }
}

// ── Delete single ─────────────────────────────────────────────────────────────
async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await agentSlotApi.remove(deleteTarget.value._id)
    deleteTarget.value = null
    await loadSlots()
  } catch (e: any) {
    apiError.value = e?.response?.data?.message ?? 'Failed to delete slot'
    deleteTarget.value = null
  } finally {
    deleting.value = false
  }
}

// ── Book by agent ─────────────────────────────────────────────────────────────
function openBook(slot: any) {
  bookingSlot.value = slot
  bookForm.value = { userPhone: '' }
  apiError.value = ''
  showBookModal.value = true
}

async function confirmBook() {
  if (!bookForm.value.userPhone) {
    apiError.value = 'Customer phone number is required'
    return
  }
  booking.value = true
  apiError.value = ''
  try {
    await agentSlotApi.bookByAgent(bookingSlot.value._id, bookForm.value.userPhone)
    showBookModal.value = false
    bookingSlot.value = null
    await loadSlots()
  } catch (e: any) {
    apiError.value = e?.response?.data?.message ?? 'Failed to book slot'
  } finally {
    booking.value = false
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4">
    <!-- Breadcrumb -->
    <nav class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
      <router-link to="/agent/venues" class="hover:text-indigo-500 transition-colors">Venues</router-link>
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
      <span class="text-indigo-600">Slots</span>
    </nav>

    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-3xl font-black text-gray-900">Slot Management</h1>
        <p class="text-gray-500 text-sm mt-1">Create, publish, and book venue time slots for your customers.</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="openBulk"
          class="flex items-center gap-2 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
          Bulk Generate
        </button>
        <button
          @click="openCreate"
          class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
          Add Slot
        </button>
      </div>
    </div>

    <!-- Stats bar -->
    <div class="grid grid-cols-4 gap-px bg-gray-100 rounded-2xl overflow-hidden mb-6 border border-gray-100">
      <div class="bg-white px-6 py-5">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Slots</p>
        <p class="text-4xl font-black text-gray-900 mt-1 leading-none">{{ String(totalSlots).padStart(2, '0') }}</p>
      </div>
      <div class="bg-white px-6 py-5 border-l border-indigo-100">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Published</p>
        <p class="text-4xl font-black text-green-600 mt-1 leading-none">{{ String(publishedSlots).padStart(2, '0') }}</p>
      </div>
      <div class="bg-white px-6 py-5 border-l border-indigo-100">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Booked</p>
        <p class="text-4xl font-black text-blue-600 mt-1 leading-none">{{ String(bookedSlots).padStart(2, '0') }}</p>
      </div>
      <div class="bg-white px-6 py-5 border-l border-indigo-100">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Drafts</p>
        <p class="text-4xl font-black text-gray-400 mt-1 leading-none">{{ String(draftSlotsCount).padStart(2, '0') }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-5">
      <select
        v-model="filterVenueId"
        class="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:border-indigo-400 bg-white cursor-pointer min-w-[180px]"
      >
        <option value="">All Venues</option>
        <option v-for="v in venues" :key="v._id" :value="v._id">{{ v.title }}</option>
      </select>

      <input
        v-model="filterDate"
        type="date"
        class="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:border-indigo-400 bg-white"
      />

      <div class="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button
          v-for="opt in [{ label: 'All', val: '' }, { label: 'Draft', val: 'draft' }, { label: 'Published', val: 'publish' }, { label: 'Unpublished', val: 'unpublish' }]"
          :key="opt.val"
          @click="filterStatus = opt.val"
          class="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
          :class="filterStatus === opt.val ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        >
          {{ opt.label }}
        </button>
      </div>

      <button v-if="filterDate || filterStatus || filterVenueId" @click="filterVenueId = ''; filterDate = ''; filterStatus = ''" class="text-xs font-bold text-gray-400 hover:text-red-500 px-2 transition-colors">
        Clear filters
      </button>
    </div>

    <!-- Bulk action bar -->
    <Transition name="slide-down">
      <div v-if="selectedIds.size > 0" class="flex flex-wrap items-center gap-2 mb-4 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5">
        <span class="text-sm font-bold text-indigo-700 mr-1">{{ selectedIds.size }} slot{{ selectedIds.size !== 1 ? 's' : '' }} selected</span>
        <div class="flex flex-wrap gap-2 ml-auto">
          <button
            v-if="selectedPublishableIds.length > 0"
            @click="bulkStatusAction = 'publish'"
            class="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition-colors"
          >
            Publish ({{ selectedPublishableIds.length }})
          </button>
          <button
            v-if="selectedUnpublishableIds.length > 0"
            @click="bulkStatusAction = 'unpublish'"
            class="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-yellow-200 text-yellow-700 hover:bg-yellow-50 transition-colors"
          >
            Unpublish ({{ selectedUnpublishableIds.length }})
          </button>
          <button
            v-if="selectedDraftIds.length > 0"
            @click="openBulkUpdate"
            class="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            Update Price ({{ selectedDraftIds.length }})
          </button>
          <button
            v-if="selectedDraftIds.length > 0"
            @click="showBulkDeleteConfirm = true"
            class="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete ({{ selectedDraftIds.length }})
          </button>
          <button @click="selectedIds = new Set()" class="text-xs font-bold text-gray-400 hover:text-gray-600 px-2 transition-colors">Clear</button>
        </div>
      </div>
    </Transition>

    <!-- Global message (info/error) -->
    <div v-if="apiError && !showCreateModal && !showBulkModal && !showBookModal && !showEditModal && !showBulkUpdateModal && !deleteTarget && !showBulkDeleteConfirm" class="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
      {{ apiError }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <svg class="w-8 h-8 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>

    <!-- Empty -->
    <div v-else-if="!slots.length" class="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
      <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      <p class="text-gray-400 font-bold">No slots found</p>
      <p class="text-gray-400 text-sm mt-1">Create a slot or use Bulk Generate to open up availability.</p>
      <div class="flex gap-2 justify-center mt-4">
        <button @click="openBulk" class="text-sm font-bold text-indigo-500 border border-indigo-200 px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors">Bulk Generate</button>
        <button @click="openCreate" class="text-sm font-bold text-white bg-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors">Add Slot</button>
      </div>
    </div>

    <!-- Slots table -->
    <div v-else class="bg-white rounded-2xl border border-gray-100 overflow-scroll">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="px-4 py-3 w-8">
              <input
                type="checkbox"
                :checked="selectAll"
                @change="(e) => selectAll = (e.target as HTMLInputElement).checked"
                :disabled="selectableSlots.length === 0"
                class="rounded border-gray-300 text-indigo-600 cursor-pointer disabled:opacity-30"
              />
            </th>
            <th class="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 py-3">Date</th>
            <th class="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 py-3">Venue</th>
            <th class="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 py-3">Time</th>
            <th class="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 py-3">Price</th>
            <th class="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 py-3">Status</th>
            <th class="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 py-3">Booking</th>
            <th class="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 py-3">Customer</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr
            v-for="slot in slots"
            :key="slot._id"
            class="hover:bg-gray-50/50 transition-colors"
            :class="{ 'bg-indigo-50/40': selectedIds.has(slot._id) }"
          >
            <!-- Checkbox (all non-booked slots) -->
            <td class="px-4 py-4">
              <input
                v-if="slot.bookingStatus !== 'booked'"
                type="checkbox"
                :checked="selectedIds.has(slot._id)"
                @change="toggleRow(slot._id)"
                class="rounded border-gray-300 text-indigo-600 cursor-pointer"
              />
            </td>

            <!-- Date -->
            <td class="px-4 py-4 font-bold text-gray-800 whitespace-nowrap">
              {{ formatDate(slot.date) }}
            </td>

            <!-- Venue -->
            <td class="px-4 py-4 text-gray-600 whitespace-nowrap">
              {{ venueName(slot) }}
            </td>

            <!-- Time -->
            <td class="px-4 py-4 whitespace-nowrap">
              <span class="font-bold text-gray-800">{{ formatTime(slot.startTime) }}</span>
              <span class="text-gray-400 mx-1">–</span>
              <span class="font-bold text-gray-800">{{ formatTime(slot.endTime) }}</span>
            </td>

            <!-- Price -->
            <td class="px-4 py-4 whitespace-nowrap">
              <span class="font-black text-gray-900">৳{{ slot.slotPrice?.toLocaleString() }}</span>
              <span v-if="slot.commissionAmount" class="text-[10px] text-gray-400 block">commission ৳{{ slot.commissionAmount }}</span>
            </td>

            <!-- Slot status -->
            <td class="px-4 py-4">
              <span
                class="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                :class="statusBadge(slot.status).cls"
              >
                {{ statusBadge(slot.status).label }}
              </span>
            </td>

            <!-- Booking status -->
            <td class="px-4 py-4">
              <div class="space-y-1">
                <span
                  class="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                  :class="bookingBadge(slot.bookingStatus).cls"
                >
                  {{ bookingBadge(slot.bookingStatus).label }}
                </span>
                <span
                  v-if="paymentBadge(slot.bookingInfo?.paymentStatus)"
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full block w-fit"
                  :class="paymentBadge(slot.bookingInfo?.paymentStatus)!.cls"
                >
                  {{ paymentBadge(slot.bookingInfo?.paymentStatus)!.label }}
                </span>
              </div>
            </td>

            <!-- Customer -->
            <td class="px-4 py-4 text-gray-500 text-xs">
              <template v-if="slot.bookingStatus === 'booked' && slot.bookingInfo">
                <p class="font-bold text-gray-700">{{ slot.bookingInfo.paymentMethod ?? '—' }}</p>
                <p v-if="slot.bookingInfo.paymentNumber" class="text-gray-400">{{ slot.bookingInfo.paymentNumber }}</p>
              </template>
              <span v-else class="text-gray-300">—</span>
            </td>

            <!-- Actions -->
            <td class="px-4 py-4">
              <div class="flex items-center gap-1.5 justify-end">
                <!-- Edit price -->
                <button
                  v-if="slot.bookingStatus !== 'booked'"
                  @click="openEdit(slot)"
                  class="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Update price"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2.414a2 2 0 01.586-1.414z"/>
                  </svg>
                </button>

                <!-- Publish / Unpublish toggle -->
                <button
                  v-if="slot.status === 'draft' || slot.status === 'unpublish'"
                  @click="toggleStatus(slot)"
                  class="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition-colors whitespace-nowrap"
                  title="Publish slot"
                >
                  Publish
                </button>
                <button
                  v-else-if="slot.status === 'publish' && !slot.bookingStatus"
                  @click="toggleStatus(slot)"
                  class="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-yellow-200 text-yellow-700 hover:bg-yellow-50 transition-colors whitespace-nowrap"
                  title="Unpublish slot"
                >
                  Unpublish
                </button>

                <!-- Book for customer (published + available) -->
                <button
                  v-if="slot.status === 'publish' && !slot.bookingStatus"
                  @click="openBook(slot)"
                  class="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors whitespace-nowrap"
                >
                  Book
                </button>

                <!-- Delete (draft only) -->
                <button
                  v-if="slot.status === 'draft'"
                  @click="deleteTarget = slot"
                  class="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete slot"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && slots.length > 0" class="flex items-center justify-between mt-5">
      <div class="flex items-center gap-3">
        <p class="text-xs text-gray-400">
          Page {{ currentPage }} of {{ totalPages }} · {{ total }} slot{{ total !== 1 ? 's' : '' }}
        </p>
        <div class="flex items-center gap-1.5">
          <label class="text-xs text-gray-400">Rows</label>
          <select
            v-model="pageSize"
            class="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700 outline-none focus:border-indigo-400 bg-white cursor-pointer"
          >
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <template v-for="p in pageNumbers" :key="p">
          <span v-if="p === '...'" class="px-1 text-gray-300 text-sm">…</span>
          <button
            v-else
            @click="goToPage(p as number)"
            class="min-w-[32px] h-8 rounded-lg text-xs font-bold transition-colors"
            :class="currentPage === p ? 'bg-indigo-600 text-white' : 'border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'"
          >
            {{ p }}
          </button>
        </template>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>

    <!-- ── Create Slot Modal ────────────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="!saving && (showCreateModal = false)" />
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-black text-gray-900">Add New Slot</h2>
            <button @click="showCreateModal = false" :disabled="saving" class="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div v-if="apiError" class="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-sm">{{ apiError }}</div>

          <div class="px-6 py-5 space-y-4">
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Venue *</label>
              <select v-model="createForm.venueId" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition bg-white cursor-pointer">
                <option value="" disabled>Select venue</option>
                <option v-for="v in venues" :key="v._id" :value="v._id">{{ v.title }}</option>
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Date *</label>
              <input v-model="createForm.date" type="date" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Start Time *</label>
                <input v-model="createForm.startTime" type="time" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">End Time *</label>
                <input v-model="createForm.endTime" type="time" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Slot Price (৳) *</label>
              <input v-model="createForm.slotPrice" type="number" min="0" step="0.01" placeholder="e.g. 1500" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
            </div>
          </div>

          <div class="flex gap-3 px-6 py-4 border-t border-gray-100">
            <button @click="showCreateModal = false" :disabled="saving" class="flex-1 text-sm font-bold text-gray-600 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            <button @click="saveSlot" :disabled="saving" class="flex-1 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-xl transition-colors disabled:opacity-50">
              {{ saving ? 'Creating…' : 'Create Slot' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Bulk Generate Modal ─────────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="showBulkModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="!saving && (showBulkModal = false)" />
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 class="text-lg font-black text-gray-900">Bulk Generate Slots</h2>
              <p class="text-xs text-gray-400 mt-0.5">Creates slots from venue templates for each day in the range.</p>
            </div>
            <button @click="showBulkModal = false" :disabled="saving" class="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors ml-4 flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div v-if="apiError" class="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-sm">{{ apiError }}</div>

          <div class="px-6 py-5 space-y-4">
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Venue *</label>
              <select v-model="bulkForm.venueId" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition bg-white cursor-pointer">
                <option value="" disabled>Select venue</option>
                <option v-for="v in venues" :key="v._id" :value="v._id">{{ v.title }}</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Start Date *</label>
                <input v-model="bulkForm.startDate" type="date" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">End Date *</label>
                <input v-model="bulkForm.endDate" type="date" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Price Override (৳)
                <span class="normal-case font-normal text-gray-400 ml-1">— leave empty to use venue template prices</span>
              </label>
              <input
                v-model="bulkForm.slotPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 1500"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>

            <div class="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-xs text-indigo-700">
              <p class="font-bold mb-0.5">How it works</p>
              <p class="leading-relaxed">Reads your venue's slot templates and creates one slot per template per day. If a price override is set, all generated slots use that price instead of the template price.</p>
            </div>
          </div>

          <div class="flex gap-3 px-6 py-4 border-t border-gray-100">
            <button @click="showBulkModal = false" :disabled="saving" class="flex-1 text-sm font-bold text-gray-600 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            <button @click="saveBulk" :disabled="saving" class="flex-1 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-xl transition-colors disabled:opacity-50">
              {{ saving ? 'Generating…' : 'Generate Slots' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Edit Slot Modal ───────────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="!saving && (showEditModal = false)" />
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 class="text-lg font-black text-gray-900">Edit Slot</h2>
              <p v-if="editTarget" class="text-xs text-gray-400 mt-0.5">
                {{ formatDate(editTarget.date) }} · {{ formatTime(editTarget.startTime) }} – {{ formatTime(editTarget.endTime) }}
              </p>
            </div>
            <button @click="showEditModal = false" :disabled="saving" class="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div v-if="apiError" class="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-sm">{{ apiError }}</div>

          <div class="px-6 py-5">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Slot Price (৳) *</label>
            <input
              v-model="editForm.slotPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 1500"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>

          <div class="flex gap-3 px-6 py-4 border-t border-gray-100">
            <button @click="showEditModal = false" :disabled="saving" class="flex-1 text-sm font-bold text-gray-600 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            <button @click="saveEdit" :disabled="saving" class="flex-1 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-xl transition-colors disabled:opacity-50">
              {{ saving ? 'Saving…' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Bulk Update Price Modal ────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="showBulkUpdateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="!saving && (showBulkUpdateModal = false)" />
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 class="text-lg font-black text-gray-900">Bulk Update Price</h2>
              <p class="text-xs text-gray-400 mt-0.5">Apply new price to {{ selectedDraftIds.length }} selected draft slot{{ selectedDraftIds.length !== 1 ? 's' : '' }}.</p>
            </div>
            <button @click="showBulkUpdateModal = false" :disabled="saving" class="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div v-if="apiError" class="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-sm">{{ apiError }}</div>

          <div class="px-6 py-5">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">New Slot Price (৳) *</label>
            <input
              v-model="bulkUpdateForm.slotPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 1500"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              autofocus
            />
          </div>

          <div class="flex gap-3 px-6 py-4 border-t border-gray-100">
            <button @click="showBulkUpdateModal = false" :disabled="saving" class="flex-1 text-sm font-bold text-gray-600 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            <button @click="saveBulkUpdate" :disabled="saving" class="flex-1 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-xl transition-colors disabled:opacity-50">
              {{ saving ? 'Updating…' : 'Update Price' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Book Slot Modal ─────────────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="showBookModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="!booking && (showBookModal = false)" />
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 class="text-lg font-black text-gray-900">Book for Customer</h2>
              <p v-if="bookingSlot" class="text-xs text-gray-400 mt-0.5">
                {{ formatDate(bookingSlot.date) }} · {{ formatTime(bookingSlot.startTime) }} – {{ formatTime(bookingSlot.endTime) }}
              </p>
            </div>
            <button @click="showBookModal = false" :disabled="booking" class="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div v-if="apiError" class="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-sm">{{ apiError }}</div>

          <div class="px-6 py-5">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Customer Phone *</label>
            <input
              v-model="bookForm.userPhone"
              type="tel"
              placeholder="+880XXXXXXXXXX"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            />
            <p class="text-xs text-gray-400 mt-1.5">If this phone isn't registered, an account will be auto-created.</p>
          </div>

          <div class="flex gap-3 px-6 py-4 border-t border-gray-100">
            <button @click="showBookModal = false" :disabled="booking" class="flex-1 text-sm font-bold text-gray-600 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            <button @click="confirmBook" :disabled="booking" class="flex-1 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 py-2.5 rounded-xl transition-colors disabled:opacity-50">
              {{ booking ? 'Booking…' : 'Confirm Booking' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Delete Confirm Modal ────────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="!deleting && (deleteTarget = null)" />
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </div>
          <h3 class="text-lg font-black text-gray-900 mb-1">Delete Slot?</h3>
          <p class="text-sm text-gray-500 mb-5">
            {{ formatDate(deleteTarget?.date) }} · {{ formatTime(deleteTarget?.startTime) }} – {{ formatTime(deleteTarget?.endTime) }}
            <br>This action cannot be undone.
          </p>
          <div class="flex gap-3">
            <button @click="deleteTarget = null" :disabled="deleting" class="flex-1 text-sm font-bold text-gray-600 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            <button @click="confirmDelete" :disabled="deleting" class="flex-1 text-sm font-bold text-white bg-red-500 hover:bg-red-600 py-2.5 rounded-xl transition-colors disabled:opacity-50">
              {{ deleting ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Bulk Delete Confirm Modal ──────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="showBulkDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="!deleting && (showBulkDeleteConfirm = false)" />
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </div>
          <h3 class="text-lg font-black text-gray-900 mb-1">Delete {{ selectedDraftIds.length }} Slot{{ selectedDraftIds.length !== 1 ? 's' : '' }}?</h3>
          <p class="text-sm text-gray-500 mb-5">Only draft slots will be deleted. This action cannot be undone.</p>
          <div class="flex gap-3">
            <button @click="showBulkDeleteConfirm = false" :disabled="deleting" class="flex-1 text-sm font-bold text-gray-600 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            <button @click="confirmBulkDelete" :disabled="deleting" class="flex-1 text-sm font-bold text-white bg-red-500 hover:bg-red-600 py-2.5 rounded-xl transition-colors disabled:opacity-50">
              {{ deleting ? 'Deleting…' : `Delete ${selectedDraftIds.length}` }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Bulk Publish / Unpublish Confirm Modal ─────────────────────────── -->
    <Transition name="modal">
      <div v-if="bulkStatusAction" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="!saving && (bulkStatusAction = null)" />
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            :class="bulkStatusAction === 'publish' ? 'bg-green-100' : 'bg-yellow-100'"
          >
            <svg class="w-6 h-6" :class="bulkStatusAction === 'publish' ? 'text-green-600' : 'text-yellow-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="bulkStatusAction === 'publish'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
            </svg>
          </div>
          <h3 class="text-lg font-black text-gray-900 mb-1 capitalize">
            {{ bulkStatusAction === 'publish' ? `Publish ${selectedPublishableIds.length}` : `Unpublish ${selectedUnpublishableIds.length}` }}
            slot{{ (bulkStatusAction === 'publish' ? selectedPublishableIds.length : selectedUnpublishableIds.length) !== 1 ? 's' : '' }}?
          </h3>
          <p class="text-sm text-gray-500 mb-5">
            {{ bulkStatusAction === 'publish'
              ? 'Selected draft and unpublished slots will be made bookable.'
              : 'Selected slots will be hidden from customers. Booked slots are skipped.' }}
          </p>
          <div class="flex gap-3">
            <button @click="bulkStatusAction = null" :disabled="saving" class="flex-1 text-sm font-bold text-gray-600 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            <button
              @click="confirmBulkStatus"
              :disabled="saving"
              class="flex-1 text-sm font-bold text-white py-2.5 rounded-xl transition-colors disabled:opacity-50"
              :class="bulkStatusAction === 'publish' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-500 hover:bg-yellow-600'"
            >
              {{ saving ? 'Updating…' : (bulkStatusAction === 'publish' ? 'Publish' : 'Unpublish') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
