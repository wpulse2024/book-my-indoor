<script setup lang="ts">
import { ref } from 'vue'
import { bookingApi } from '@/services/api'

const props = defineProps<{
  bookingId: string
  venueId: string
  venueName: string
}>()

const emit = defineEmits<{
  close: []
  submitted: [bookingId: string]
}>()

const rating = ref(0)
const hovered = ref(0)
const comment = ref('')
const isAnonymous = ref(false)
const loading = ref(false)
const error = ref('')

const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

async function submit() {
  if (!rating.value) {
    error.value = 'Please select a star rating'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await bookingApi.postReview({
      venueId: props.venueId,
      bookingId: props.bookingId,
      rating: rating.value,
      comment: comment.value.trim(),
      isAnonymous: isAnonymous.value,
    })
    emit('submitted', props.bookingId)
    emit('close')
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Failed to submit review. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
        <div>
          <h2 class="font-black text-gray-900 text-lg">Write a Review</h2>
          <p class="text-gray-400 text-xs mt-0.5 truncate max-w-xs">{{ venueName }}</p>
        </div>
        <button
          @click="emit('close')"
          class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 space-y-5">
        <!-- Star selector -->
        <div class="text-center">
          <p class="text-gray-500 text-sm font-semibold mb-3">How would you rate this venue?</p>
          <div class="flex justify-center gap-2 mb-2">
            <button
              v-for="i in 5"
              :key="i"
              type="button"
              @mouseenter="hovered = i"
              @mouseleave="hovered = 0"
              @click="rating = i"
              class="focus:outline-none transition-transform hover:scale-110"
            >
              <svg
                class="w-10 h-10 transition-colors"
                :class="i <= (hovered || rating) ? 'text-orange-400' : 'text-gray-200'"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>
          </div>
          <p
            class="text-sm font-black transition-colors"
            :class="rating ? 'text-orange-500' : 'text-gray-300'"
          >
            {{ ratingLabels[hovered || rating] || '&nbsp;' }}
          </p>
        </div>

        <!-- Comment -->
        <div>
          <label class="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
            Your Review <span class="font-normal normal-case tracking-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            v-model="comment"
            rows="4"
            maxlength="1000"
            placeholder="Tell others about your experience..."
            class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          ></textarea>
          <p class="text-right text-xs text-gray-300 mt-1">{{ comment.length }}/1000</p>
        </div>

        <!-- Anonymous toggle -->
        <label class="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            v-model="isAnonymous"
            class="w-4 h-4 rounded border-gray-300 text-blue-700 focus:ring-blue-500 cursor-pointer"
          />
          <span class="text-sm text-gray-600 font-semibold">Post anonymously</span>
        </label>

        <!-- Error -->
        <div v-if="error" class="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm">
          {{ error }}
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 pb-6 flex gap-3">
        <button
          @click="emit('close')"
          class="flex-1 border border-gray-200 text-gray-600 font-semibold text-sm py-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="submit"
          :disabled="loading"
          class="flex-1 bg-blue-700 text-white font-black text-sm py-3 rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Submitting…</span>
          <span v-else>Submit Review</span>
        </button>
      </div>
    </div>
  </div>
</template>
