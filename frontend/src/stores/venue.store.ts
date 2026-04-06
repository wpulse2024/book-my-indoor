import { defineStore } from 'pinia'
import { ref } from 'vue'
import { venueApi } from '@/services/api'
import type { Venue, AvailableSlot, VenueFilters, PaginatedData } from '@/types'
import venuesData from '@/data/venues.json'
import slotsData from '@/data/slots.json'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const useVenueStore = defineStore('venue', () => {
  const venues = ref<Venue[]>([])
  const currentVenue = ref<Venue | null>(null)
  const availableSlots = ref<AvailableSlot[]>([])
  const pagination = ref<Omit<PaginatedData<unknown>, 'items'> | null>(null)
  const isLoading = ref(false)
  const slotsLoading = ref(false)

  const defaultFilters: VenueFilters = {
    search: '',
    date: '',
    timeFrom: '',
    timeTo: '',
    type: '',
    area: '',
    priceMin: null,
    priceMax: null,
    lat: null,
    lng: null,
    radiusKm: 10,
  }

  const filters = ref<VenueFilters>({ ...defaultFilters })

  // ── Mock helpers ──────────────────────────────────────────────────────────

  function applyMockVenues() {
    let results = venuesData as Venue[]

    if (filters.value.search) {
      const q = filters.value.search.toLowerCase()
      results = results.filter(
        (v) => v.name.toLowerCase().includes(q) || v.area.toLowerCase().includes(q),
      )
    }
    if (filters.value.type) {
      results = results.filter((v) => v.type === filters.value.type)
    }
    if (filters.value.area) {
      const a = filters.value.area.toLowerCase()
      results = results.filter((v) => v.area.toLowerCase().includes(a))
    }

    venues.value = results
    pagination.value = { total: results.length, page: 1, perPage: 12, totalPages: 1 }
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async function fetchVenues(page = 1) {
    isLoading.value = true
    try {
      if (USE_MOCK) {
        await delay(400)
        applyMockVenues()
        return
      }
      const res = await venueApi.list({ ...filters.value, page, perPage: 12 })
      const { items, ...meta } = res.data.data
      venues.value = items
      pagination.value = meta
    } catch {
      applyMockVenues()
    } finally {
      isLoading.value = false
    }
  }

  async function fetchVenue(slug: string) {
    isLoading.value = true
    try {
      if (USE_MOCK) {
        await delay(300)
        currentVenue.value = (venuesData as Venue[]).find((v) => v.slug === slug) ?? null
        return
      }
      const res = await venueApi.get(slug)
      currentVenue.value = res.data.data
    } catch {
      currentVenue.value = (venuesData as Venue[]).find((v) => v.slug === slug) ?? null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchAvailableSlots(slug: string, _date: string) {
    slotsLoading.value = true
    availableSlots.value = []
    try {
      if (USE_MOCK) {
        await delay(350)
        const venue = (venuesData as Venue[]).find((v) => v.slug === slug)
        availableSlots.value = venue
          ? ((slotsData as Record<string, AvailableSlot[]>)[venue.id] ?? [])
          : []
        return
      }
      const res = await venueApi.availableSlots(slug, _date)
      availableSlots.value = res.data.data
    } catch {
      const venue = (venuesData as Venue[]).find((v) => v.slug === slug)
      availableSlots.value = venue
        ? ((slotsData as Record<string, AvailableSlot[]>)[venue.id] ?? [])
        : []
    } finally {
      slotsLoading.value = false
    }
  }

  function resetFilters() {
    filters.value = { ...defaultFilters }
  }

  return {
    venues,
    currentVenue,
    availableSlots,
    pagination,
    filters,
    isLoading,
    slotsLoading,
    fetchVenues,
    fetchVenue,
    fetchAvailableSlots,
    resetFilters,
  }
})

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
