<template>
  <!-- Blue/indigo gradient background matching the reference -->
  <section style="background: linear-gradient(135deg, #4361ee 0%, #3b4fd4 50%, #4361ee 100%);" class="py-16 md:py-20 px-4 sm:px-6">
    <div class="max-w-5xl mx-auto">

      <!-- Section header — centred, white -->
      <div class="text-center mb-14">
        <h2 class="text-2xl md:text-3xl font-black text-white mb-3">
          Ready in Three Steps
        </h2>
        <p class="text-blue-100/80 text-sm">
          Booking your court has never been easier
        </p>
      </div>

      <!-- Steps row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">

        <!-- Step 01 — Search -->
        <div class="flex flex-col items-center text-center">
          <!-- Icon box -->
          <div class="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-5 backdrop-blur-sm">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <!-- Number -->
          <p class="text-white/30 font-black text-4xl leading-none mb-3 tracking-tight">01</p>
          <!-- Label -->
          <h3 class="text-white font-black text-base mb-2">Search</h3>
          <!-- Description -->
          <p class="text-blue-100/70 text-sm leading-relaxed max-w-[200px]">
            Find the perfect venue near you
          </p>
        </div>

        <!-- Step 02 — Book -->
        <div class="flex flex-col items-center text-center">
          <div class="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-5 backdrop-blur-sm">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <p class="text-white/30 font-black text-4xl leading-none mb-3 tracking-tight">02</p>
          <h3 class="text-white font-black text-base mb-2">Book</h3>
          <p class="text-blue-100/70 text-sm leading-relaxed max-w-[200px]">
            Select your time slot and confirm
          </p>
        </div>

        <!-- Step 03 — Play -->
        <div class="flex flex-col items-center text-center">
          <div class="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-5 backdrop-blur-sm">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <p class="text-white/30 font-black text-4xl leading-none mb-3 tracking-tight">03</p>
          <h3 class="text-white font-black text-base mb-2">Play</h3>
          <p class="text-blue-100/70 text-sm leading-relaxed max-w-[200px]">
            Show up and enjoy your game
          </p>
        </div>

      </div>
    </div>
  </section>
</template>
