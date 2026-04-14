<template>
  <section class="bg-white py-16 md:py-20 px-4 sm:px-6">
    <div class="max-w-6xl mx-auto">

      <div class="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">

        <!-- ── Left: text + bullets + CTA ──────────────────────────────── -->
        <div class="flex-1 max-w-lg">

          <!-- Badge -->
          <div class="inline-flex items-center bg-blue-50 border border-blue-100 rounded-full px-3 py-1 mb-5">
            <span class="text-blue-600 text-xs font-bold uppercase tracking-widest">For Venue Owners</span>
          </div>

          <!-- Heading -->
          <h2 class="font-black text-gray-900 leading-tight mb-2" style="font-size: clamp(1.8rem, 3.5vw, 2.6rem);">
            Grow Your Business
          </h2>
          <p class="font-black leading-tight mb-5" style="font-size: clamp(1.8rem, 3.5vw, 2.6rem); color: #4361ee;">
            List for Free!
          </p>

          <!-- Description -->
          <p class="text-gray-500 text-sm leading-relaxed mb-7 max-w-sm">
            Join hundreds of venue owners maximizing their bookings and revenue.
            Zero commission, full control.
          </p>

          <!-- Bullet list -->
          <ul class="space-y-3 mb-8">
            <li v-for="item in features" :key="item" class="flex items-center gap-3 text-sm text-gray-700">
              <span class="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </span>
              {{ item }}
            </li>
          </ul>

          <!-- CTA button -->
          <RouterLink
            to="/register"
            class="inline-flex items-center gap-2 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all duration-200 shadow-md"
            style="background: #4361ee;"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            Register Your Venue
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </RouterLink>

        </div>

        <!-- ── Right: 2×2 stat cards ────────────────────────────────────── -->
        <div class="flex-shrink-0 w-full max-w-sm grid grid-cols-2 gap-4">

          <!-- +145% Revenue Increase -->
          <div class="bg-gray-50 border border-gray-100 rounded-2xl p-5">
            <div class="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center mb-3">
              <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
            <p class="text-gray-900 font-black text-2xl leading-none mb-1">+145%</p>
            <p class="text-gray-500 text-xs">Revenue Increase</p>
          </div>

          <!-- 100% Secure Platform -->
          <div class="bg-gray-50 border border-gray-100 rounded-2xl p-5">
            <div class="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center mb-3">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <p class="text-gray-900 font-black text-2xl leading-none mb-1">100%</p>
            <p class="text-gray-500 text-xs">Secure Platform</p>
          </div>

          <!-- 500+ Active Venues -->
          <div class="bg-gray-50 border border-gray-100 rounded-2xl p-5">
            <div class="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center mb-3">
              <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <p class="text-gray-900 font-black text-2xl leading-none mb-1">500+</p>
            <p class="text-gray-500 text-xs">Active Venues</p>
          </div>

          <!-- 5 min Quick Setup -->
          <div class="bg-gray-50 border border-gray-100 rounded-2xl p-5">
            <div class="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center mb-3">
              <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <p class="text-gray-900 font-black text-2xl leading-none mb-1">5 min</p>
            <p class="text-gray-500 text-xs">Quick Setup</p>
          </div>

        </div>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const features = [
  'Free venue listing - no hidden fees',
  'Automated booking management system',
  'Real-time revenue analytics dashboard',
  'Secure payment processing',
  '24/7 dedicated customer support',
]
</script>
