<script setup lang="ts">
import { ref, computed } from 'vue'

const location = ref('Gulshan, Dhaka')
const selectedDate = ref('')

const displayDate = computed(() => selectedDate.value
  ? new Date(selectedDate.value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  : 'Today'
)
</script>

<template>
  <section class="max-w-6xl mx-auto px-6 py-5">
    <div
      class="relative overflow-hidden rounded-2xl"
      style="min-height: 400px; background: linear-gradient(115deg, #03080f 0%, #070f1e 35%, #091826 60%, #061220 100%);"
    >
      <!-- Subtle grid texture -->
      <div class="absolute inset-0 opacity-[0.04]"
        style="background-image: linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px); background-size: 48px 48px;">
      </div>

      <!-- Blue glow top-right -->
      <div class="absolute -top-32 -right-10 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style="background: radial-gradient(circle, #1a5fd4 0%, transparent 65%);"></div>

      <!-- Teal glow mid-right (suggests the person in teal suit) -->
      <div class="absolute top-0 right-0 h-full w-1/2 pointer-events-none overflow-hidden">
        <div class="absolute inset-0"
          style="background: linear-gradient(to left, rgba(10,70,80,0.18) 0%, rgba(5,35,55,0.12) 40%, transparent 100%);"></div>
        <!-- Vertical teal accent suggesting person silhouette -->
        <div class="absolute top-0 bottom-0 right-12 w-28 opacity-[0.07]"
          style="background: linear-gradient(180deg, transparent 0%, #0e7a7a 20%, #0a5c6e 60%, transparent 100%);"></div>
      </div>

      <!-- Bottom fade -->
      <div class="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style="background: linear-gradient(to top, rgba(3,8,15,0.5), transparent);"></div>

      <!-- Content -->
      <div class="relative z-10 px-10 md:px-14 py-12 flex flex-col justify-center" style="max-width: 560px; min-height: 400px;">
        <h1 class="font-black text-white leading-[0.95] mb-5 uppercase tracking-tight" style="font-size: clamp(2.8rem, 5vw, 3.8rem);">
          The Next<br />
          Court Is<br />
          <span class="text-orange-500">Yours.</span>
        </h1>
        <p class="text-gray-400 text-sm mb-9 leading-relaxed">
          Book premium indoor arenas across Dhaka in seconds.
        </p>

        <!-- Search bar -->
        <div class="bg-white rounded-xl flex items-stretch overflow-hidden shadow-2xl" style="max-width: 480px;">
          <!-- Search icon slot -->
          <div class="flex items-center px-4 border-r border-gray-100">
            <svg class="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Location -->
          <div class="flex items-center gap-2 px-4 py-3 flex-1 border-r border-gray-100">
            <svg class="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="text-sm text-gray-700 font-medium truncate">{{ location }}</span>
          </div>

          <!-- Date -->
          <div class="relative flex items-center gap-2 px-4 py-3 flex-shrink-0">
            <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="text-sm text-gray-500 font-medium">{{ displayDate }}</span>
            <input
              v-model="selectedDate"
              type="date"
              class="absolute inset-0 opacity-0 cursor-pointer w-full"
            />
          </div>

          <!-- FIND button -->
          <button class="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black text-sm px-7 py-3 tracking-widest transition-colors uppercase flex-shrink-0">
            Find
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
