import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type {
  ApiSuccess,
  User,
  Venue,
  AvailableSlot,
  Booking,
  WalletTransaction,
  PaginatedData,
  VenueFilters,
  Review,
} from '@/types'

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('bmi_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Unwrap data and handle 401
http.interceptors.response.use(
  (res: AxiosResponse) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bmi_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  sendOtp: (phone: string) =>
    http.post<ApiSuccess<{ expires: number }>>('/auth/otp/send', { phone }),

  verifyOtp: (phone: string, otp: string) =>
    http.post<ApiSuccess<{ token: string; user: User }>>('/auth/otp/verify', { phone, otp }),

  register: (data: { name: string; email: string; phone: string; password: string }) =>
    http.post<ApiSuccess<{ token: string; user: User }>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    http.post<ApiSuccess<{ token: string; user: User }>>('/auth/login', data),

  logout: () => http.post('/auth/logout'),

  me: () => http.get<ApiSuccess<User>>('/auth/me'),

  updateProfile: (data: Partial<User>) =>
    http.put<ApiSuccess<User>>('/user/profile', data),
}

// ─── Venues ──────────────────────────────────────────────────────────────────

export const venueApi = {
  list: (filters: Partial<VenueFilters> & { page?: number; perPage?: number }) =>
    http.get<ApiSuccess<PaginatedData<Venue>>>('/user/venues', { params: filters }),

  nearby: (lat: number, lng: number, radiusKm = 10) =>
    http.get<ApiSuccess<Venue[]>>('/user/venues/nearby', { params: { lat, lng, radius: radiusKm } }),

  get: (slug: string) =>
    http.get<ApiSuccess<Venue>>(`/user/venues/${slug}`),

  availableSlots: (slug: string, date: string) =>
    http.get<ApiSuccess<AvailableSlot[]>>(`/user/venues/${slug}/slots/available`, { params: { date } }),

  reviews: (venueId: string, page = 1) =>
    http.get<ApiSuccess<PaginatedData<Review>>>(`/user/venues/${venueId}/reviews`, { params: { page } }),
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export const bookingApi = {
  create: (data: { slotId: string; bookingDate: string; paymentMethod: string; notes?: string }) =>
    http.post<ApiSuccess<Booking>>('/user/bookings', data),

  list: (page = 1) =>
    http.get<ApiSuccess<PaginatedData<Booking>>>('/user/bookings', { params: { page } }),

  get: (id: string) =>
    http.get<ApiSuccess<Booking>>(`/user/bookings/${id}`),

  cancel: (id: string) =>
    http.delete<ApiSuccess<Booking>>(`/user/bookings/${id}`),

  qr: (id: string) =>
    http.get<ApiSuccess<{ qrDataUrl: string }>>(`/user/bookings/${id}/qr`),

  postReview: (data: { venueId: string; bookingId: string; rating: number; comment: string }) =>
    http.post<ApiSuccess<Review>>('/user/reviews', data),
}

// ─── Wallet ──────────────────────────────────────────────────────────────────

export const walletApi = {
  get: () => http.get<ApiSuccess<{ balance: number }>>('/user/wallet'),

  topup: (amount: number, method: string) =>
    http.post<ApiSuccess<{ redirectUrl?: string; transaction?: WalletTransaction }>>(
      '/user/wallet/topup',
      { amount, method },
    ),

  transactions: (page = 1) =>
    http.get<ApiSuccess<PaginatedData<WalletTransaction>>>('/user/wallet/transactions', {
      params: { page },
    }),
}

export default http
