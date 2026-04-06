import { defineStore } from 'pinia'
import { ref } from 'vue'
import { bookingApi, walletApi } from '@/services/api'
import type { Booking, WalletTransaction, PaginatedData, AvailableSlot, Venue } from '@/types'
import bookingsData from '@/data/bookings.json'
import transactionsData from '@/data/transactions.json'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const useBookingStore = defineStore('booking', () => {
  const bookings = ref<Booking[]>([])
  const currentBooking = ref<Booking | null>(null)
  const walletBalance = ref(2700)
  const walletTransactions = ref<WalletTransaction[]>([])
  const pagination = ref<Omit<PaginatedData<unknown>, 'items'> | null>(null)
  const isLoading = ref(false)

  const draft = ref<{
    slot: AvailableSlot | null
    venue: Venue | null
    date: string
  }>({ slot: null, venue: null, date: '' })

  async function createBooking(data: {
    slotId: string
    bookingDate: string
    paymentMethod: string
    notes?: string
  }) {
    isLoading.value = true
    try {
      if (USE_MOCK) {
        await delay(800)
        const newBooking: Booking = {
          id: `bk-${Date.now()}`,
          userId: 'u1',
          slot: draft.value.slot!,
          venue: draft.value.venue as unknown as Booking['venue'],
          branchId: null,
          bookingDate: data.bookingDate,
          startTime: draft.value.slot!.startTime,
          endTime: draft.value.slot!.endTime,
          status: 'confirmed',
          totalAmount: draft.value.slot!.effectivePrice,
          paymentStatus: 'paid',
          paymentMethod: data.paymentMethod as Booking['paymentMethod'],
          qrToken: `qr-${Date.now()}`,
          notes: data.notes ?? null,
          createdAt: new Date().toISOString(),
        }
        if (data.paymentMethod === 'wallet') {
          walletBalance.value -= newBooking.totalAmount
        }
        currentBooking.value = newBooking
        bookings.value.unshift(newBooking)
        return newBooking
      }
      const res = await bookingApi.create(data)
      currentBooking.value = res.data.data
      return res.data.data
    } finally {
      isLoading.value = false
    }
  }

  async function fetchBookings(page = 1) {
    isLoading.value = true
    try {
      if (USE_MOCK) {
        await delay(400)
        bookings.value = bookingsData as unknown as Booking[]
        pagination.value = { total: bookingsData.length, page, perPage: 20, totalPages: 1 }
        return
      }
      const res = await bookingApi.list(page)
      const { items, ...meta } = res.data.data
      bookings.value = items
      pagination.value = meta
    } catch {
      bookings.value = bookingsData as unknown as Booking[]
    } finally {
      isLoading.value = false
    }
  }

  async function fetchBooking(id: string) {
    isLoading.value = true
    try {
      if (USE_MOCK) {
        await delay(300)
        currentBooking.value =
          (bookingsData as unknown as Booking[]).find((b) => b.id === id) ?? null
        return
      }
      const res = await bookingApi.get(id)
      currentBooking.value = res.data.data
    } finally {
      isLoading.value = false
    }
  }

  async function cancelBooking(id: string) {
    if (USE_MOCK) {
      await delay(500)
      const idx = bookings.value.findIndex((b) => b.id === id)
      if (idx !== -1) bookings.value[idx] = { ...bookings.value[idx], status: 'cancelled' }
      return
    }
    const res = await bookingApi.cancel(id)
    const updated = res.data.data
    const idx = bookings.value.findIndex((b) => b.id === id)
    if (idx !== -1) bookings.value[idx] = updated
    if (currentBooking.value?.id === id) currentBooking.value = updated
  }

  async function fetchWallet() {
    if (USE_MOCK) return
    try {
      const res = await walletApi.get()
      walletBalance.value = res.data.data.balance
    } catch { /* keep default */ }
  }

  async function fetchWalletTransactions(page = 1) {
    isLoading.value = true
    try {
      if (USE_MOCK) {
        await delay(400)
        walletTransactions.value = transactionsData as WalletTransaction[]
        pagination.value = { total: transactionsData.length, page, perPage: 20, totalPages: 1 }
        return
      }
      const res = await walletApi.transactions(page)
      const { items, ...meta } = res.data.data
      walletTransactions.value = items
      pagination.value = meta
    } catch {
      walletTransactions.value = transactionsData as WalletTransaction[]
    } finally {
      isLoading.value = false
    }
  }

  async function topupWallet(amount: number, method: string) {
    isLoading.value = true
    try {
      if (USE_MOCK) {
        await delay(600)
        walletBalance.value += amount
        walletTransactions.value.unshift({
          id: `tx-${Date.now()}`,
          type: 'credit',
          amount,
          reference: `TOPUP-MOCK-${Date.now()}`,
          description: `Wallet top-up via ${method}`,
          createdAt: new Date().toISOString(),
        })
        return {}
      }
      const res = await walletApi.topup(amount, method)
      return res.data.data
    } finally {
      isLoading.value = false
    }
  }

  function setDraft(slot: AvailableSlot, venue: Venue, date: string) {
    draft.value = { slot, venue, date }
  }

  return {
    bookings,
    currentBooking,
    walletBalance,
    walletTransactions,
    pagination,
    isLoading,
    draft,
    createBooking,
    fetchBookings,
    fetchBooking,
    cancelBooking,
    fetchWallet,
    fetchWalletTransactions,
    topupWallet,
    setDraft,
  }
})

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
