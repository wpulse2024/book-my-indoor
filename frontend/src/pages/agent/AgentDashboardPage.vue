<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()

const stats = [
  { label: 'Total Revenue',  value: '$4,250.00', trend: '+8%',  icon: 'revenue',   color: 'bg-indigo-50 text-indigo-500' },
  { label: "Today's",        value: '12',        trend: null,   icon: 'today',     color: 'bg-blue-50 text-blue-500' },
  { label: 'Active Slots',   value: '48',        trend: null,   icon: 'slots',     color: 'bg-orange-50 text-orange-400' },
  { label: 'Customers',      value: '850',       trend: null,   icon: 'customers', color: 'bg-indigo-50 text-indigo-400' },
  { label: 'Avg Rating',     value: '4.8',       sub: '/5',     icon: 'rating',    color: 'bg-yellow-50 text-yellow-400' },
]

const bookings = [
  { id: '#8829', initials: 'MS', color: 'bg-gray-300', name: 'Marcus Sterling',  slot: 'Grand Ballroom - West', time: 'Today, 02:00 PM',     status: 'confirmed' },
  { id: '#8830', initials: 'EL', color: 'bg-teal-400',  name: 'Elena Lopez',      slot: 'Conference Hall B',     time: 'Today, 04:30 PM',     status: 'pending' },
  { id: '#8831', initials: 'DW', color: 'bg-slate-400', name: 'David Wright',     slot: 'Rooftop Lounge',        time: 'Tomorrow, 07:00 PM',  status: 'confirmed' },
  { id: '#8832', initials: 'SC', color: 'bg-green-400', name: 'Sarah Chen',       slot: 'Garden Suite',          time: 'Mar 22, 11:00 AM',    status: 'confirmed' },
  { id: '#8833', initials: 'RJ', color: 'bg-blue-400',  name: 'Robert Jenkins',   slot: 'Exhibition Area',       time: 'Mar 23, 09:00 AM',    status: 'pending' },
]

// Fake sparkline points for the trend chart
const trendPoints = [10, 16, 18, 14, 20, 22, 28, 32, 26, 30, 38, 35, 40, 36, 30, 28, 22, 20, 18, 22, 30, 36, 30, 24, 15, 18, 24, 30, 36, 40]
const maxY = Math.max(...trendPoints)
const chartH = 120
const chartW = 480

function polyline() {
  return trendPoints.map((v, i) => {
    const x = (i / (trendPoints.length - 1)) * chartW
    const y = chartH - (v / maxY) * chartH
    return `${x},${y}`
  }).join(' ')
}

const revenueByDay = [30, 45, 50, 60, 80, 55, 40]
const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const maxBar = Math.max(...revenueByDay)
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-3xl font-black text-gray-900">Overview</h1>
        <p class="text-gray-500 text-sm mt-1">Welcome back, here's what's happening today at your venue.</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
          Add New Slot
        </button>
        <button class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          Create Booking
        </button>
        <button class="p-2.5 border border-gray-300 bg-white rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
        </button>
      </div>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-5 gap-4 mb-6">
      <div v-for="s in stats" :key="s.label" class="bg-white rounded-2xl border border-gray-100 px-5 py-4">
        <div class="flex items-center justify-between mb-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" :class="s.color">
            <!-- Revenue -->
            <svg v-if="s.icon === 'revenue'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            <!-- Today bookings -->
            <svg v-else-if="s.icon === 'today'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
            <!-- Slots -->
            <svg v-else-if="s.icon === 'slots'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <!-- Customers -->
            <svg v-else-if="s.icon === 'customers'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <!-- Rating -->
            <svg v-else-if="s.icon === 'rating'" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
          </div>
          <span v-if="s.trend" class="text-xs font-bold text-green-600 flex items-center gap-0.5">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
            {{ s.trend }}
          </span>
        </div>
        <p class="text-xs text-gray-400 font-medium">{{ s.label }}</p>
        <p class="text-2xl font-black text-gray-900 mt-0.5 leading-none">
          {{ s.value }}<span v-if="s.sub" class="text-base text-gray-400 font-semibold">{{ s.sub }}</span>
        </p>
      </div>
    </div>

    <!-- Charts row -->
    <div class="grid grid-cols-3 gap-5 mb-6">
      <!-- Bookings Trend -->
      <div class="col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="font-bold text-gray-900">Bookings Trend</h3>
            <p class="text-xs text-gray-400 mt-0.5">Daily volume for the last 30 days</p>
          </div>
          <button class="text-xs font-bold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">Last 30 Days</button>
        </div>

        <!-- SVG chart -->
        <div class="relative">
          <!-- Y labels -->
          <div class="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-gray-300 font-medium pr-2">
            <span>40</span><span>30</span><span>20</span><span>10</span><span>0</span>
          </div>
          <div class="pl-6">
            <svg :viewBox="`0 0 ${chartW} ${chartH}`" class="w-full h-32 overflow-visible">
              <!-- Fill area -->
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#6366f1" stop-opacity="0.15"/>
                  <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <polygon
                :points="`0,${chartH} ${polyline()} ${chartW},${chartH}`"
                fill="url(#trendFill)"
              />
              <polyline
                :points="polyline()"
                fill="none"
                stroke="#6366f1"
                stroke-width="2.5"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
            </svg>
            <!-- X labels -->
            <div class="flex justify-between text-[10px] text-gray-300 font-medium mt-1">
              <span>MAR 01</span><span>MAR 08</span><span>MAR 15</span><span>MAR 22</span><span>MAR 29</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right widgets -->
      <div class="flex flex-col gap-4">
        <!-- Needs Attention -->
        <div class="bg-indigo-600 rounded-2xl p-5 text-white">
          <p class="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">Needs Attention</p>
          <p class="text-5xl font-black leading-none">5 <span class="text-3xl">Pending</span></p>
          <button class="mt-4 w-full py-2.5 bg-white/20 hover:bg-white/30 text-white text-sm font-bold rounded-xl transition-colors">
            Review Now
          </button>
        </div>

        <!-- Revenue by day bar chart -->
        <div class="bg-white rounded-2xl border border-gray-100 p-5 flex-1">
          <h4 class="font-bold text-gray-900 text-sm mb-4">Revenue by Day</h4>
          <div class="flex items-end gap-1.5 h-16">
            <div
              v-for="(v, i) in revenueByDay"
              :key="i"
              class="flex-1 rounded-t-md transition-all"
              :class="i === 4 ? 'bg-indigo-600' : 'bg-indigo-200'"
              :style="{ height: (v / maxBar * 100) + '%' }"
            />
          </div>
          <div class="flex justify-between mt-1.5 text-[10px] text-gray-400 font-medium">
            <span v-for="d in days" :key="d">{{ d }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 class="font-bold text-gray-900">Recent Activity</h3>
        <RouterLink to="/agent/bookings" class="text-sm font-bold text-indigo-600 hover:text-indigo-700 no-underline">View All Bookings</RouterLink>
      </div>
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-50">
            <th class="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
            <th class="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Venue Slot</th>
            <th class="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Time</th>
            <th class="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="b in bookings" :key="b.id" class="hover:bg-gray-50/50 transition-colors">
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0" :class="b.color">
                  {{ b.initials }}
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-800">{{ b.name }}</p>
                  <p class="text-xs text-gray-400">ID: {{ b.id }}</p>
                </div>
              </div>
            </td>
            <td class="px-5 py-3.5 text-sm text-gray-700">{{ b.slot }}</td>
            <td class="px-5 py-3.5 text-sm text-gray-500">{{ b.time }}</td>
            <td class="px-5 py-3.5">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wide"
                :class="b.status === 'confirmed' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'"
              >
                {{ b.status }}
              </span>
            </td>
            <td class="px-5 py-3.5 text-right">
              <button class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
