<template>
  <section class="py-16 md:py-20 px-4 sm:px-6 bg-gray-50">
    <div class="max-w-5xl mx-auto">

      <!-- Section header -->
      <div class="text-center mb-14">
        <p class="text-orange-500 text-xs font-black uppercase tracking-widest mb-3">Simple &amp; Fast</p>
        <h2 class="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">
          Ready in Three Steps
        </h2>
        <p class="text-gray-400 text-sm mt-3 max-w-xs mx-auto">
          The fastest way to get on the court — from search to confirmation in under a minute.
        </p>
      </div>

      <!-- Steps -->
      <div class="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">

        <!-- Connecting line (desktop only) -->
        <div
          class="hidden md:block absolute top-10 left-[calc(16.666%+1rem)] right-[calc(16.666%+1rem)] h-px"
          style="background: linear-gradient(90deg, transparent 0%, #e5e7eb 20%, #e5e7eb 80%, transparent 100%);"
        ></div>

        <!-- Step 1 — Find -->
        <div class="flex flex-col items-center text-center relative">
          <div class="relative mb-6">
            <div class="w-20 h-20 rounded-2xl bg-blue-700 flex items-center justify-center shadow-xl shadow-blue-700/25 relative z-10">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <!-- Step number badge -->
            <span class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center z-20 shadow-md">1</span>
          </div>
          <h3 class="font-black text-gray-900 uppercase text-sm tracking-widest mb-3">Find</h3>
          <p class="text-gray-500 text-sm leading-relaxed max-w-xs">
            Discover top-rated venues near you with real-time availability and smart filters.
          </p>
        </div>

        <!-- Step 2 — Book -->
        <div class="flex flex-col items-center text-center relative">
          <div class="relative mb-6">
            <div class="w-20 h-20 rounded-2xl bg-orange-500 flex items-center justify-center shadow-xl shadow-orange-500/25 relative z-10">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-700 text-white text-xs font-black flex items-center justify-center z-20 shadow-md">2</span>
          </div>
          <h3 class="font-black text-gray-900 uppercase text-sm tracking-widest mb-3">Book</h3>
          <p class="text-gray-500 text-sm leading-relaxed max-w-xs">
            Pick your slot and pay securely — wallet, card, or mobile banking. Instant confirmation.
          </p>
        </div>

        <!-- Step 3 — Play -->
        <div class="flex flex-col items-center text-center relative">
          <div class="relative mb-6">
            <div class="w-20 h-20 rounded-2xl bg-lime-500 flex items-center justify-center shadow-xl shadow-lime-500/25 relative z-10">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center z-20 shadow-md">3</span>
          </div>
          <h3 class="font-black text-gray-900 uppercase text-sm tracking-widest mb-3">Play</h3>
          <p class="text-gray-500 text-sm leading-relaxed max-w-xs">
            Show your QR code at the venue and step straight onto the court. Game on.
          </p>
        </div>

      </div>

      <!-- CTA -->
      <div class="text-center mt-12">
        <RouterLink
          to="/discover"
          class="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-black text-sm uppercase tracking-widest px-8 py-3.5 rounded-xl transition-colors duration-200 shadow-lg"
        >
          Find a Venue Now
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
        </RouterLink>
      </div>

    </div>
  </section>
</template>
