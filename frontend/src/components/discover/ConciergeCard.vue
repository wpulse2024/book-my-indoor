<template>
  <div class="rounded-2xl overflow-hidden flex flex-col" style="background: linear-gradient(145deg, #1a3faa, #1e4fd8, #2563eb); min-height: 300px;">
    <div class="p-6 flex-1">
      <h3 class="font-black text-white italic uppercase leading-tight mb-3" style="font-size: 1.5rem;">
        Can't Find<br />a Court?
      </h3>
      <p class="text-blue-200 text-sm leading-relaxed mb-6">
        Our concierge will find a private venue for your team within 20 minutes.
      </p>
      <button class="border-2 border-white text-white font-black text-sm px-5 py-2.5 rounded-xl hover:bg-white hover:text-blue-700 transition-all uppercase tracking-wide">
        Live Concierge
      </button>
    </div>

    <!-- Map / icon area -->
    <div class="relative h-32 flex items-center justify-end px-6"
      style="background: linear-gradient(to top, rgba(0,0,30,0.3), transparent);">
      <!-- Map icon -->
      <svg class="w-16 h-16 text-white/20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
      </svg>
      <!-- Headset icon bottom-right -->
      <div class="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
        <svg class="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 18v-6a9 9 0 0118 0v6" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
        </svg>
      </div>
    </div>
  </div>
</template>
