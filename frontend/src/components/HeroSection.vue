<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import http from '@/services/api'

const router = useRouter()

// ── Search state ─────────────────────────────────────────────────────────────
const search       = ref('')
const selectedDate = ref('')
const selectedType = ref('')
const dateInputRef = ref<HTMLInputElement | null>(null)

const displayDate = computed(() => {
  if (!selectedDate.value) return 'Pick a date'
  return new Date(selectedDate.value + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
})

// ── Sport quick-filter pills ─────────────────────────────────────────────────
const sportTypes = [
  { label: 'Badminton',  value: 'badminton',    icon: '🏸' },
  { label: 'Futsal',     value: 'futsal',        icon: '⚽' },
  { label: 'Cricket',    value: 'cricket_turf',  icon: '🏏' },
  { label: 'Tennis',     value: 'tennis',        icon: '🎾' },
  { label: 'Basketball', value: 'basketball',    icon: '🏀' },
  { label: 'Swimming',   value: 'swimming',      icon: '🏊' },
]

function toggleType(value: string) {
  selectedType.value = selectedType.value === value ? '' : value
}

function find() {
  const query: Record<string, string> = {}
  if (search.value.trim()) query.search = search.value.trim()
  if (selectedDate.value)   query.date   = selectedDate.value
  if (selectedType.value)   query.type   = selectedType.value
  router.push({ path: '/discover', query })
}

function openDatePicker() {
  const el = dateInputRef.value
  if (!el) return
  if (typeof (el as any).showPicker === 'function') {
    ;(el as any).showPicker()
  } else {
    el.click()
  }
}

// ── Real stats from /venues/stats ────────────────────────────────────────────
const statsLoading  = ref(true)
const venueCount    = ref(0)
const playerCount   = ref(0)
const cityCount     = ref(0)

onMounted(async () => {
  try {
    const res = await http.get<{ venueCount: number; playerCount: number; cityCount: number }>('/venues/stats')
    venueCount.value  = res.data.venueCount
    playerCount.value = res.data.playerCount
    cityCount.value   = res.data.cityCount
  } catch {
    // keep zeros — don't crash the page
  } finally {
    statsLoading.value = false
  }
})

const displayVenueCount = computed(() =>
  statsLoading.value ? '…' : venueCount.value > 0 ? `${venueCount.value}+` : '0'
)
const displayPlayers = computed(() =>
  statsLoading.value ? '…' : playerCount.value > 0 ? `${playerCount.value}+` : '0'
)
const displayCities = computed(() =>
  statsLoading.value ? '…' : cityCount.value > 0 ? `${cityCount.value}+` : '0'
)
</script>

<template>
  <section class="relative overflow-hidden" style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);">

    <!-- Dot-grid texture -->
    <div
      class="absolute inset-0 opacity-[0.04] pointer-events-none"
      style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 30px 30px;"
    ></div>

    <!-- Blue ambient glow — centre -->
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full pointer-events-none"
      style="background: radial-gradient(ellipse, rgba(37,99,235,0.20) 0%, transparent 65%);"
    ></div>

    <!-- Orange glow — bottom right -->
    <div
      class="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none"
      style="background: radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 60%);"
    ></div>

    <!-- ── Main content ─────────────────────────────────────────────────── -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-12 md:pt-24 md:pb-16 relative z-10 text-center">

      <!-- Eyebrow badge -->
      <div class="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 rounded-full px-4 py-1.5 mb-8">
        <span class="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
        <span class="text-orange-400 text-xs font-bold uppercase tracking-widest">Dhaka's #1 Indoor Sports Platform</span>
      </div>

      <!-- Headline -->
      <h1
        class="text-white font-black uppercase tracking-tight leading-[0.9] mb-6 mx-auto"
        style="font-size: clamp(2.6rem, 7.5vw, 5.5rem); max-width: 900px;"
      >
        The Next Court<br />
        Is <span class="text-orange-500">Yours</span>
      </h1>

      <p class="text-gray-400 text-sm md:text-base mb-10 max-w-lg mx-auto leading-relaxed">
        Discover and book the best indoor sports venues in your city.
        From futsal to basketball — find your perfect match.
      </p>

      <!-- ── Search card ──────────────────────────────────────────────── -->
      <div class="bg-white rounded-2xl shadow-2xl shadow-black/50 overflow-hidden max-w-2xl mx-auto">
        <div class="flex flex-col sm:flex-row items-stretch">

          <!-- Location / name input -->
          <div class="flex items-center gap-3 px-5 py-4 flex-1 border-b sm:border-b-0 sm:border-r border-gray-100 min-w-0">
            <svg class="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <input
              v-model="search"
              type="text"
              placeholder="Area or venue name…"
              class="text-gray-900 font-semibold text-sm w-full bg-transparent outline-none placeholder-gray-400 border-none focus:ring-0"
              @keyup.enter="find"
            />
          </div>

          <!-- Date picker -->
          <div
            class="relative flex items-center gap-3 px-5 py-4 border-b sm:border-b-0 sm:border-r border-gray-100 cursor-pointer select-none"
            @click="openDatePicker"
          >
            <svg class="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p
              class="font-semibold text-sm whitespace-nowrap"
              :class="selectedDate ? 'text-gray-900' : 'text-gray-400'"
            >
              {{ displayDate }}
            </p>
            <input
              ref="dateInputRef"
              v-model="selectedDate"
              type="date"
              class="absolute opacity-0 pointer-events-none"
              style="width:1px;height:1px;top:0;left:0;"
              tabindex="-1"
            />
          </div>

          <!-- Search button -->
          <button
            @click="find"
            class="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black text-sm uppercase tracking-widest transition-all duration-200 px-8 py-4 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            Search
          </button>
        </div>
      </div>

      <!-- Sport quick-filter pills -->
      <div class="flex flex-wrap gap-2 mt-6 justify-center">
        <button
          v-for="sport in sportTypes"
          :key="sport.value"
          @click="toggleType(sport.value)"
          :class="[
            'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-200',
            selectedType === sport.value
              ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30'
              : 'border-white/15 text-gray-400 hover:border-white/35 hover:text-white bg-white/5'
          ]"
        >
          {{ sport.icon }} {{ sport.label }}
        </button>
      </div>

    </div>

    <!-- ── Stats strip ──────────────────────────────────────────────────── -->
    <div class="border-t border-white/8 bg-white/5 backdrop-blur-sm">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-3 divide-x divide-white/10">

        <div class="text-center px-4">
          <p class="text-white font-black text-2xl md:text-3xl leading-none">{{ displayVenueCount }}</p>
          <p class="text-gray-500 text-[11px] uppercase tracking-widest mt-1.5">Venues</p>
        </div>

        <div class="text-center px-4">
          <p class="text-white font-black text-2xl md:text-3xl leading-none">{{ displayPlayers }}</p>
          <p class="text-gray-500 text-[11px] uppercase tracking-widest mt-1.5">Players</p>
        </div>

        <div class="text-center px-4">
          <p class="text-white font-black text-2xl md:text-3xl leading-none">{{ displayCities }}</p>
          <p class="text-gray-500 text-[11px] uppercase tracking-widest mt-1.5">Cities</p>
        </div>

      </div>
    </div>

  </section>
</template>
