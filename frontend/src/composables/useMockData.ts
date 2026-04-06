/**
 * useMockData — populates stores with local JSON fixtures.
 * Used when VITE_USE_MOCK=true or when the API is unreachable.
 * Call once from App.vue.
 */
import { useVenueStore } from '@/stores/venue.store'
import { useBookingStore } from '@/stores/booking.store'
import { useAuthStore } from '@/stores/auth.store'
import venuesData from '@/data/venues.json'
import slotsData from '@/data/slots.json'
import bookingsData from '@/data/bookings.json'
import transactionsData from '@/data/transactions.json'
import type { Venue, Booking, WalletTransaction, AvailableSlot, PaginatedData } from '@/types'

export function useMockData() {
  const venueStore = useVenueStore()
  const bookingStore = useBookingStore()
  const authStore = useAuthStore()

  function seedVenues() {
    venueStore.venues = venuesData as Venue[]
    venueStore.pagination = {
      total: venuesData.length,
      page: 1,
      perPage: 12,
      totalPages: 1,
    }
  }

  function seedVenue(slug: string) {
    const venue = venuesData.find((v) => v.slug === slug) as Venue | undefined
    if (venue) venueStore.currentVenue = venue
  }

  function seedSlots(venueId: string) {
    const slots = (slotsData as Record<string, AvailableSlot[]>)[venueId] ?? []
    venueStore.availableSlots = slots
  }

  function seedBookings() {
    bookingStore.bookings = bookingsData as unknown as Booking[]
    bookingStore.pagination = {
      total: bookingsData.length,
      page: 1,
      perPage: 20,
      totalPages: 1,
    }
  }

  function seedWallet() {
    bookingStore.walletBalance = 2700
    bookingStore.walletTransactions = transactionsData as WalletTransaction[]
    const txPagination: Omit<PaginatedData<unknown>, 'items'> = {
      total: transactionsData.length,
      page: 1,
      perPage: 20,
      totalPages: 1,
    }
    bookingStore.pagination = txPagination
  }

  function seedMockUser() {
    if (!authStore.user) {
      authStore.user = {
        id: 'u1',
        name: 'Rafiq Ahmed',
        email: 'rafiq@example.com',
        phone: '01711000001',
        avatar: null,
        walletBalance: 2700,
        autoCreated: false,
        createdAt: '2024-01-15T00:00:00Z',
      }
      authStore.token = 'mock-token-demo'
    }
  }

  return { seedVenues, seedVenue, seedSlots, seedBookings, seedWallet, seedMockUser }
}
