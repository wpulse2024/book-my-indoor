<script setup lang="ts">
import StepCard from './StepCard.vue'
</script>

<template>
  <section class="bg-blue-50 py-20 px-6">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-2xl font-black text-gray-900 uppercase mb-2 tracking-widest">Ready in Three Steps</h2>
      <p class="text-gray-400 text-sm mb-16">The fastest way to get on the court</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
        <!-- Find -->
        <StepCard
          title="Find"
          description="Discover top-rated venues near your location with real-time availability."
          icon-bg="bg-blue-700"
        >
          <template #icon>
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </template>
        </StepCard>

        <!-- Book -->
        <StepCard
          title="Book"
          description="Select your preferred time slot and pay securely via multiple payment methods."
          icon-bg="bg-orange-500"
        >
          <template #icon>
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </template>
        </StepCard>

        <!-- Play -->
        <StepCard
          title="Play"
          description="Show your booking confirmation at the venue and start your session!"
          icon-bg="bg-lime-500"
        >
          <template #icon>
            <!-- Soccer ball icon -->
            <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-3.5H9l3-5.5 3 5.5h-2v3.5h-2z" />
              <circle cx="12" cy="12" r="9" fill="none" stroke="white" stroke-width="1.5" opacity="0.4"/>
              <path d="M12 3.5l2.5 3.5H9.5L12 3.5z M12 20.5l-2.5-3.5h5L12 20.5z M3.5 12l3.5-2.5v5L3.5 12z M20.5 12l-3.5 2.5v-5L20.5 12z M6.3 6.3l3.5 1.2-1.2 3.5L6.3 6.3z M17.7 17.7l-3.5-1.2 1.2-3.5 2.3 4.7z M6.3 17.7l1.2-3.5 3.5 1.2-4.7 2.3z M17.7 6.3l-1.2 3.5-3.5-1.2 4.7-2.3z" opacity="0.5"/>
            </svg>
          </template>
        </StepCard>
      </div>
    </div>
  </section>
</template>
