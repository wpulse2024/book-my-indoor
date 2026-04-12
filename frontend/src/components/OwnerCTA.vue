<template>
  <section class="relative overflow-hidden bg-gray-950 py-16 md:py-20 px-4 sm:px-6">

    <!-- Dot-grid texture -->
    <div
      class="absolute inset-0 opacity-[0.03] pointer-events-none"
      style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 28px 28px;"
    ></div>

    <!-- Blue accent glow left -->
    <div
      class="absolute -left-40 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
      style="background: radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 60%);"
    ></div>

    <!-- Orange glow right -->
    <div
      class="absolute -right-20 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
      style="background: radial-gradient(circle, rgba(234,88,12,0.14) 0%, transparent 60%);"
    ></div>

    <div class="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">

      <!-- Left: text -->
      <div>
        <div class="inline-flex items-center gap-2 bg-lime-400/10 border border-lime-400/20 rounded-full px-4 py-1.5 mb-5">
          <span class="w-1.5 h-1.5 rounded-full bg-lime-400"></span>
          <span class="text-lime-400 text-xs font-bold uppercase tracking-widest">For Venue Owners</span>
        </div>

        <h2 class="font-black text-white uppercase leading-[0.9] mb-4" style="font-size: clamp(1.9rem, 4vw, 3rem);">
          Own a Venue?<br />
          <span class="text-lime-400">List it Today.</span>
        </h2>

        <p class="text-gray-400 text-sm leading-relaxed max-w-sm">
          Join <span class="text-white font-semibold">100+ venues</span> already reaching
          thousands of athletes through CourtKinetic. Zero setup fees. Start earning in minutes.
        </p>

        <!-- Mini stats -->
        <div class="flex items-center gap-6 mt-6">
          <div>
            <p class="text-white font-black text-lg leading-none">10k+</p>
            <p class="text-gray-600 text-[11px] uppercase tracking-wide mt-0.5">Active Users</p>
          </div>
          <div class="w-px h-8 bg-gray-800"></div>
          <div>
            <p class="text-white font-black text-lg leading-none">৳0</p>
            <p class="text-gray-600 text-[11px] uppercase tracking-wide mt-0.5">Setup Cost</p>
          </div>
          <div class="w-px h-8 bg-gray-800"></div>
          <div>
            <p class="text-white font-black text-lg leading-none">24/7</p>
            <p class="text-gray-600 text-[11px] uppercase tracking-wide mt-0.5">Support</p>
          </div>
        </div>
      </div>

      <!-- Right: CTA card -->
      <div class="flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm text-center min-w-[260px]">
        <div class="w-14 h-14 bg-lime-400/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg class="w-7 h-7 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
        </div>
        <p class="text-white font-black text-base mb-1.5">Ready to grow?</p>
        <p class="text-gray-500 text-xs mb-6 leading-relaxed">
          List your venue and get your first booking within 24 hours.
        </p>
        <RouterLink
          to="/login"
          class="block w-full bg-lime-400 hover:bg-lime-300 text-gray-950 font-black text-sm uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-lime-400/20"
        >
          Subscribe Your Venue
        </RouterLink>
        <p class="text-gray-700 text-xs mt-4">No credit card required</p>
      </div>

    </div>
  </section>
</template>
