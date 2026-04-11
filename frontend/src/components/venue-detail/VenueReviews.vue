<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/services/api'

const props = defineProps<{
  venueId: string
}>()

const reviews = ref<any[]>([])
const loading = ref(false)

onMounted(async () => {
  if (!props.venueId) return
  loading.value = true
  try {
    const res = await http.get<any>(`/venues/${props.venueId}/reviews`)
    const data = res.data
    reviews.value = Array.isArray(data) ? data : (data?.items ?? data?.data ?? [])
  } catch (e: any) {
    // 404 means endpoint not yet implemented — silently ignore
  } finally {
    loading.value = false
  }
})

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h3 class="font-black text-gray-900 text-sm uppercase tracking-widest">Reviews</h3>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 2" :key="i" class="animate-pulse flex gap-3">
        <div class="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-3 bg-gray-200 rounded w-1/3"></div>
          <div class="h-3 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>

    <!-- No reviews -->
    <div v-else-if="!reviews.length" class="text-gray-400 text-sm py-4">
      No reviews yet. Be the first to review this venue after your visit.
    </div>

    <!-- Review list -->
    <div v-else class="space-y-4">
      <div v-for="review in reviews" :key="review._id ?? review.id" class="border-b border-gray-100 pb-5 last:border-0">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <img
              v-if="review.userAvatar || review.user?.avatar"
              :src="review.userAvatar ?? review.user?.avatar"
              :alt="review.userName ?? review.user?.name"
              class="w-10 h-10 rounded-full object-cover"
            />
            <div
              v-else
              class="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-black flex-shrink-0"
            >
              {{ initials(review.userName ?? review.user?.name ?? 'U') }}
            </div>
            <div>
              <p class="font-black text-gray-900 text-sm">{{ review.userName ?? review.user?.name ?? 'Anonymous' }}</p>
              <p class="text-gray-400 text-xs">{{ new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}</p>
            </div>
          </div>
          <div class="flex gap-0.5">
            <svg
              v-for="i in 5"
              :key="i"
              class="w-4 h-4"
              :class="i <= review.rating ? 'text-orange-400' : 'text-gray-200'"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">{{ review.comment }}</p>
      </div>
    </div>
  </div>
</template>
