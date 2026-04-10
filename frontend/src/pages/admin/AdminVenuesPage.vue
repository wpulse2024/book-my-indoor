<script setup lang="ts">
import { ref, computed } from 'vue'

const search = ref('')
const region = ref('All Regions')
const status = ref('All')

const venues = [
  {
    id: 'VF-90210',
    name: 'The Glass Pavilion',
    image: 'https://picsum.photos/seed/glass-pavilion/80/80',
    owner: { name: 'Jordan Smith', role: 'Elite Agent' },
    location: 'Beverly Hills, CA',
    region: 'North America',
    totalSlots: 42,
    slotFill: 85,
    status: 'active',
  },
  {
    id: 'VF-11201',
    name: 'Urban Loft Spaces',
    image: 'https://picsum.photos/seed/urban-loft/80/80',
    owner: { name: 'Sarah Jenkins', role: 'Senior Partner' },
    location: 'Brooklyn, NY',
    region: 'North America',
    totalSlots: 18,
    slotFill: 40,
    status: 'active',
  },
  {
    id: 'VF-44021',
    name: 'Neon Lounge',
    image: 'https://picsum.photos/seed/neon-lounge/80/80',
    owner: { name: 'Michael Chen', role: 'Local Agent' },
    location: 'Tokyo, JP',
    region: 'Asia Pacific',
    totalSlots: 5,
    slotFill: 10,
    status: 'inactive',
  },
  {
    id: 'VF-88290',
    name: 'The Boardroom Hub',
    image: 'https://picsum.photos/seed/boardroom-hub/80/80',
    owner: { name: 'Sarah Jenkins', role: 'Senior Partner' },
    location: 'London, UK',
    region: 'Europe',
    totalSlots: 114,
    slotFill: 95,
    status: 'active',
  },
]

const filtered = computed(() =>
  venues.filter(v => {
    const matchSearch = !search.value || v.name.toLowerCase().includes(search.value.toLowerCase()) || v.id.toLowerCase().includes(search.value.toLowerCase())
    const matchRegion = region.value === 'All Regions' || v.region === region.value
    const matchStatus = status.value === 'All' || v.status === status.value.toLowerCase()
    return matchSearch && matchRegion && matchStatus
  })
)
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-2xl font-black text-gray-900">Venues</h1>
        <p class="text-gray-500 text-sm mt-1">Manage, monitor, and configure the status of all available event spaces across your global network.</p>
      </div>
      <button class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
        Add New Venue
      </button>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-3 mb-5">
      <div class="flex-1 relative">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Search by name, ID or owner..."
          class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
        />
      </div>
      <select v-model="region" class="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-indigo-400 cursor-pointer">
        <option>All Regions</option>
        <option>North America</option>
        <option>Europe</option>
        <option>Asia Pacific</option>
      </select>
      <select v-model="status" class="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-indigo-400 cursor-pointer">
        <option>All</option>
        <option>Active</option>
        <option>Inactive</option>
      </select>
      <button class="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Venue Name</th>
            <th class="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Owner</th>
            <th class="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Location</th>
            <th class="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Total Slots</th>
            <th class="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
            <th class="text-right px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="venue in filtered" :key="venue.id" class="hover:bg-gray-50/50 transition-colors">
            <!-- Venue name -->
            <td class="px-5 py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <img :src="venue.image" :alt="venue.name" class="w-full h-full object-cover" />
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-900">{{ venue.name }}</p>
                  <p class="text-xs text-gray-400">ID: {{ venue.id }}</p>
                </div>
              </div>
            </td>
            <!-- Owner -->
            <td class="px-5 py-4">
              <p class="text-sm font-semibold text-gray-800">{{ venue.owner.name }}</p>
              <p class="text-xs text-gray-400">{{ venue.owner.role }}</p>
            </td>
            <!-- Location -->
            <td class="px-5 py-4">
              <p class="text-sm text-gray-700">{{ venue.location }}</p>
              <p class="text-xs text-gray-400">{{ venue.region }}</p>
            </td>
            <!-- Slots -->
            <td class="px-5 py-4">
              <div class="flex items-center gap-3">
                <span class="text-sm font-bold text-gray-800 w-8">{{ String(venue.totalSlots).padStart(2, '0') }}</span>
                <div class="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full bg-indigo-500"
                    :style="{ width: venue.slotFill + '%' }"
                  />
                </div>
              </div>
            </td>
            <!-- Status -->
            <td class="px-5 py-4">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide"
                :class="venue.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
              >
                {{ venue.status }}
              </span>
            </td>
            <!-- Actions -->
            <td class="px-5 py-4">
              <div class="flex items-center justify-end gap-1">
                <button class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
                <button class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-5 py-4 border-t border-gray-100">
        <p class="text-sm text-gray-500">Showing <span class="font-semibold text-gray-800">1–{{ filtered.length }}</span> of <span class="font-semibold text-gray-800">248</span> venues</p>
        <div class="flex items-center gap-2">
          <button class="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors">Previous</button>
          <button class="px-3 py-1.5 text-sm font-bold text-white bg-indigo-600 rounded-lg">1</button>
          <button class="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors">2</button>
          <button class="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors">3</button>
          <button class="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors">Next</button>
        </div>
      </div>
    </div>

    <!-- Bottom widgets -->
    <div class="grid grid-cols-3 gap-5 mt-5">
      <!-- Venue Utilization Trends -->
      <div class="col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
        <h3 class="font-bold text-gray-900 mb-1">Venue Utilization Trends</h3>
        <p class="text-xs text-gray-400 mb-5">Capacity performance metrics across all active regions.</p>
        <div class="flex items-end gap-2 h-28">
          <div v-for="(h, i) in [55, 65, 70, 80, 95, 75]" :key="i"
            class="flex-1 bg-indigo-500 rounded-t-md opacity-80 hover:opacity-100 transition-opacity"
            :style="{ height: h + '%' }"
          />
        </div>
        <div class="flex justify-between mt-2 text-xs text-gray-400 font-medium">
          <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
        </div>
      </div>

      <!-- Stats cards -->
      <div class="flex flex-col gap-4">
        <div class="bg-indigo-600 rounded-2xl p-5 text-white">
          <p class="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-2">Regional Leader</p>
          <h3 class="text-2xl font-black leading-none">North America</h3>
          <p class="text-indigo-200 text-xs mt-2 leading-relaxed">Currently dominating with 142 active venues and 88% average occupancy rate this quarter.</p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 p-5">
          <p class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Pending Approval</p>
          <p class="text-4xl font-black text-gray-900">12</p>
        </div>
      </div>
    </div>
  </div>
</template>
