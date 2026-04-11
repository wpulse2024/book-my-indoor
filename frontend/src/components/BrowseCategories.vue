<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CategoryCard from './CategoryCard.vue'
import { categoryApi, assetUrl } from '@/services/api'

interface Category {
  _id: string
  title: string
  image?: string
  venueCount?: number
}

const categories = ref<Category[]>([])
const loading = ref(true)

const gradients = [
  'from-green-900 via-green-700 to-green-500',
  'from-slate-900 via-blue-900 to-blue-800',
  'from-gray-900 via-slate-800 to-slate-700',
  'from-red-900 via-orange-900 to-orange-700',
  'from-purple-900 via-purple-700 to-purple-500',
  'from-yellow-900 via-amber-700 to-yellow-600',
  'from-teal-900 via-teal-700 to-cyan-600',
  'from-rose-900 via-pink-800 to-rose-700',
]

onMounted(async () => {
  try {
    const res = await categoryApi.list()
    const raw = res.data
    categories.value = Array.isArray(raw) ? raw : (raw?.data ?? [])
  } catch {
    // silently fail — page still renders without categories
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="max-w-6xl mx-auto px-6 py-8">
    <p class="text-orange-500 text-xs font-black uppercase tracking-widest mb-2">Categories</p>
    <h2 class="text-2xl font-black text-gray-900 uppercase mb-6">Browse by Venue Type</h2>

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        v-for="i in 4"
        :key="i"
        class="rounded-xl bg-gray-100 animate-pulse"
        style="aspect-ratio: 1;"
      />
    </div>

    <!-- Empty state -->
    <p v-else-if="categories.length === 0" class="text-gray-400 text-sm">
      No categories found.
    </p>

    <!-- Grid -->
    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <RouterLink
        v-for="(cat, i) in categories"
        :key="cat._id"
        :to="{ path: '/discover', query: { categoryId: cat._id } }"
        class="block"
      >
        <CategoryCard
          :name="cat.title"
          :count="cat.venueCount"
          :gradient="gradients[i % gradients.length]"
          :image="cat.image ? assetUrl(cat.image) : undefined"
        />
      </RouterLink>
    </div>
  </section>
</template>
