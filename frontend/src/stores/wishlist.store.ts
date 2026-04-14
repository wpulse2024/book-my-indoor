import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth.store'
import { wishlistApi, assetUrl } from '@/services/api'
import { useToast } from '@/composables/useToast'
import router from '@/router'

export interface WishlistVenue {
  venueId: string
  slug: string
  name: string
  rating: number
  reviewCount: number
  image: string
}

export const useWishlistStore = defineStore('wishlist', () => {
  const ids       = ref<Set<string>>(new Set())
  const venues    = ref<WishlistVenue[]>([])
  const loading   = ref(false)
  const initialized = ref(false)

  function isWishlisted(venueId: string): boolean {
    return ids.value.has(venueId)
  }

  async function fetch() {
    const authStore = useAuthStore()
    if (!authStore.isLoggedIn) return
    loading.value = true
    try {
      const res = await wishlistApi.list()
      const raw: any[] = Array.isArray(res.data) ? res.data : []
      ids.value = new Set(raw.map((v: any) => String(v._id ?? '')))
      venues.value = raw.map((v: any): WishlistVenue => ({
        venueId: String(v._id ?? ''),
        slug:    String(v._id ?? ''),
        name:    v.title ?? '',
        rating:  v.rating ?? 0,
        reviewCount: 0,
        image:   v.images?.[0] ? assetUrl(v.images[0]) : '',
      }))
      initialized.value = true
    } catch {
      // silently fail — keep whatever state we had
    } finally {
      loading.value = false
    }
  }

  async function toggle(venueId: string) {
    const authStore = useAuthStore()
    const toast = useToast()

    if (!authStore.isLoggedIn) {
      router.push('/login')
      return
    }

    if (ids.value.has(venueId)) {
      // Optimistic remove
      ids.value = new Set([...ids.value].filter(id => id !== venueId))
      venues.value = venues.value.filter(v => v.venueId !== venueId)
      try {
        await wishlistApi.remove(venueId)
        toast.success('Removed from saved venues')
      } catch {
        // Revert on failure
        await fetch()
        toast.error('Failed to remove venue')
      }
    } else {
      // Optimistic add
      ids.value = new Set([...ids.value, venueId])
      try {
        await wishlistApi.add(venueId)
        toast.success('Venue saved!')
        // Refresh to get full venue object for the Saved Venues list
        await fetch()
      } catch {
        ids.value = new Set([...ids.value].filter(id => id !== venueId))
        toast.error('Failed to save venue')
      }
    }
  }

  function reset() {
    ids.value = new Set()
    venues.value = []
    initialized.value = false
  }

  return {
    ids,
    venues,
    loading,
    initialized,
    isWishlisted,
    fetch,
    toggle,
    reset,
  }
})
