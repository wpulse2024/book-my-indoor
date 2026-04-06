<script setup lang="ts">
import { ref } from 'vue'
const email = ref('')
</script>

<template>
  <footer class="bg-gray-950 text-gray-400">
    <div class="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
      <!-- Brand -->
      <div>
        <p class="text-white font-extrabold text-xl italic mb-3">CourtKinetic</p>
        <p class="text-gray-500 text-xs leading-relaxed">
          Dhaka's premier destination for high-velocity indoor sports booking. Built for the athlete in you.
        </p>
      </div>

      <!-- Explore -->
      <div>
        <p class="text-white font-black text-xs uppercase tracking-widest mb-5">Explore</p>
        <ul class="space-y-3 text-sm">
          <li><a href="#" class="hover:text-white transition-colors">Popular Venues</a></li>
          <li><a href="#" class="hover:text-white transition-colors">Special Offers</a></li>
          <li><a href="#" class="hover:text-white transition-colors">Upcoming Events</a></li>
          <li><a href="#" class="hover:text-white transition-colors">Gift Cards</a></li>
        </ul>
      </div>

      <!-- Company -->
      <div>
        <p class="text-white font-black text-xs uppercase tracking-widest mb-5">Company</p>
        <ul class="space-y-3 text-sm">
          <li><a href="#" class="hover:text-white transition-colors">About Us</a></li>
          <li><a href="#" class="hover:text-white transition-colors">Careers</a></li>
          <li><a href="#" class="hover:text-white transition-colors">Partner Program</a></li>
          <li><a href="#" class="hover:text-white transition-colors">Contact</a></li>
        </ul>
      </div>

      <!-- Newsletter -->
      <div>
        <p class="text-white font-black text-xs uppercase tracking-widest mb-5">Stay Updated</p>
        <input
          v-model="email"
          type="email"
          placeholder="Your email address"
          class="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-300 placeholder-gray-600 outline-none focus:border-orange-500 transition-colors mb-3"
        />
        <button class="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-3 rounded-lg uppercase tracking-widest transition-colors mb-5">
          Subscribe
        </button>
        <div class="flex items-center gap-3">
          <!-- Email -->
          <a href="#" class="text-gray-600 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </a>
          <!-- Globe -->
          <a href="#" class="text-gray-600 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </a>
          <!-- Instagram -->
          <a href="#" class="text-gray-600 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="border-t border-gray-900 py-5 px-6 text-center">
      <p class="text-gray-700 text-xs uppercase tracking-widest">
        © 2024 CourtKinetic. All Rights Reserved. Precision Engineered in Dhaka.
      </p>
    </div>
  </footer>
</template>
