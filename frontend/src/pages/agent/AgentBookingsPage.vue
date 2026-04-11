<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { agentBookingApi, assetUrl } from '@/services/api'

const bookings = ref<any[]>([])
const isLoading = ref(false)
const error = ref('')
const search = ref('')
const statusFilter = ref('all')
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const changeableStatuses = ['pending', 'confirmed', 'completed', 'cancelled']
const updatingId = ref<string | null>(null)
const updateError = ref('')

async function changeStatus(booking: any, newStatus: string) {
  if (booking.status === newStatus) return
  updatingId.value = booking._id
  updateError.value = ''
  try {
    await agentBookingApi.updateStatus(booking._id, newStatus)
    booking.status = newStatus
  } catch (e: any) {
    updateError.value = e?.response?.data?.message ?? 'Failed to update status.'
  } finally {
    updatingId.value = null
  }
}

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return bookings.value.filter(b => {
    const matchStatus = statusFilter.value === 'all' || b.status === statusFilter.value
    const matchSearch = !q ||
      b.bookingRef?.toLowerCase().includes(q) ||
      b.guestName?.toLowerCase().includes(q) ||
      b.userId?.name?.toLowerCase().includes(q) ||
      b.userId?.phone?.includes(q) ||
      b.venueId?.title?.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })
})

async function loadBookings() {
  isLoading.value = true
  error.value = ''
  try {
    const res = await agentBookingApi.list(page.value)
    bookings.value = res.data.items ?? res.data
    total.value = res.data.total ?? bookings.value.length
    totalPages.value = res.data.totalPages ?? 1
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Failed to load bookings.'
  } finally {
    isLoading.value = false
  }
}

function prevPage() {
  if (page.value > 1) { page.value--; loadBookings() }
}
function nextPage() {
  if (page.value < totalPages.value) { page.value++; loadBookings() }
}

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}

function initials(name?: string) {
  if (!name) return '??'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const statusClass: Record<string, string> = {
  confirmed: 'bg-green-50 text-green-700',
  pending:   'bg-orange-50 text-orange-600',
  completed: 'bg-blue-50 text-blue-700',
  cancelled: 'bg-red-50 text-red-600',
}

const paymentClass: Record<string, string> = {
  paid:      'bg-green-50 text-green-700',
  unpaid:    'bg-gray-100 text-gray-500',
  refunded:  'bg-purple-50 text-purple-600',
}

onMounted(loadBookings)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-3xl font-black text-gray-900">Bookings</h1>
        <p class="text-gray-500 text-sm mt-1">All bookings across your venues.</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-3 mb-5">
      <div class="relative flex-1 max-w-xs">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"/>
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Search ref, customer, venue…"
          class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        />
      </div>
      <div class="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
        <button
          v-for="opt in statusOptions"
          :key="opt.value"
          @click="statusFilter = opt.value"
          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
          :class="statusFilter === opt.value ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error || updateError" class="mb-4 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
      {{ error || updateError }}
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <!-- Loading skeleton -->
      <div v-if="isLoading" class="divide-y divide-gray-50">
        <div v-for="i in 8" :key="i" class="px-5 py-4 flex items-center gap-4 animate-pulse">
          <div class="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="h-3.5 bg-gray-200 rounded w-32" />
            <div class="h-3 bg-gray-100 rounded w-20" />
          </div>
          <div class="h-3 bg-gray-200 rounded w-24 hidden sm:block" />
          <div class="h-3 bg-gray-200 rounded w-20 hidden md:block" />
          <div class="h-6 bg-gray-200 rounded-lg w-20" />
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="!filtered.length" class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
          <svg class="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
        <p class="font-bold text-gray-700">No bookings found</p>
        <p class="text-sm text-gray-400 mt-1">Try adjusting your search or filter.</p>
      </div>

      <!-- Rows -->
      <template v-else>
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
              <th class="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Venue / Slot</th>
              <th class="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
              <th class="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
              <th class="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Payment</th>
              <th class="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th class="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Ref</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="b in filtered" :key="b._id" class="hover:bg-gray-50/50 transition-colors">
              <!-- Customer -->
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black flex-shrink-0">
                    {{ initials(b.guestName || b.userId?.name) }}
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-800 leading-tight">{{ b.guestName || b.userId?.name || '—' }}</p>
                    <p class="text-xs text-gray-400">{{ b.userId?.phone || b.userId?.email || '' }}</p>
                  </div>
                </div>
              </td>
              <!-- Venue / Slot -->
              <td class="px-5 py-3.5">
                <p class="text-sm font-medium text-gray-800 leading-tight">{{ b.venueId?.title || '—' }}</p>
                <p class="text-xs text-gray-400">{{ b.startTime }} – {{ b.endTime }}</p>
              </td>
              <!-- Date -->
              <td class="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">{{ b.bookingDate }}</td>
              <!-- Amount -->
              <td class="px-5 py-3.5 text-sm font-semibold text-gray-800">৳{{ b.price?.toLocaleString() }}</td>
              <!-- Payment -->
              <td class="px-5 py-3.5">
                <div class="flex flex-col gap-0.5">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide w-fit"
                    :class="paymentClass[b.paymentStatus] ?? 'bg-gray-100 text-gray-500'"
                  >{{ b.paymentStatus }}</span>
                  <span class="text-xs text-gray-400 capitalize">{{ b.paymentMethod }}</span>
                </div>
              </td>
              <!-- Status -->
              <td class="px-5 py-3.5">
                <div class="relative">
                  <select
                    :value="b.status"
                    :disabled="updatingId === b._id"
                    @change="changeStatus(b, ($event.target as HTMLSelectElement).value)"
                    class="appearance-none pl-2.5 pr-6 py-1 rounded-lg text-xs font-black uppercase tracking-wide border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60 disabled:cursor-wait"
                    :class="statusClass[b.status] ?? 'bg-gray-100 text-gray-500'"
                  >
                    <option v-for="s in changeableStatuses" :key="s" :value="s" class="normal-case font-normal bg-white text-gray-800">
                      {{ s.charAt(0).toUpperCase() + s.slice(1) }}
                    </option>
                  </select>
                  <svg class="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </td>
              <!-- Ref -->
              <td class="px-5 py-3.5">
                <span class="text-xs font-mono text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md">{{ b.bookingRef }}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
          <p class="text-xs text-gray-400">{{ total }} booking{{ total !== 1 ? 's' : '' }} total</p>
          <div class="flex items-center gap-2">
            <button
              @click="prevPage"
              :disabled="page === 1"
              class="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >Prev</button>
            <span class="text-xs text-gray-500 font-medium">{{ page }} / {{ totalPages }}</span>
            <button
              @click="nextPage"
              :disabled="page === totalPages"
              class="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >Next</button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
