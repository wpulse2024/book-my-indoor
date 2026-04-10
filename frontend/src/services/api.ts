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

function createApiBaseUrl() {
  const explicitUrl = import.meta.env.VITE_API_BASE_URL
  if (explicitUrl) return explicitUrl

  const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL ?? 'http://localhost:8000/'
  return new URL('api/v1', backendBaseUrl).toString().replace(/\/$/, '')
}

const http: AxiosInstance = axios.create({
  baseURL: createApiBaseUrl(),
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
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      localStorage.removeItem('bmi_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  validateUser: (identifier: string) =>
    http.post<{ isOtpLogin: boolean }>('/auth/validate-user', { identifier }),

  verifyLoginOtp: (phone: string, otp: string) =>
    http.post<{ accessToken: string; user: Partial<User> }>('/auth/verify-otp/login', { phone, otp }),

  register: (data: { name: string; email: string; phone: string; password: string }) =>
    http.post('/auth/register', data),

  login: (data: { identifier: string; password?: string; isOtpLogin: boolean }) =>
    http.post<{ message?: string; accessToken?: string; user?: Partial<User> }>('/auth/login', data),

  profile: () => http.get<Partial<User>>('/auth/profile'),

  updateProfile: (_data: Partial<User>) =>
    Promise.reject(new Error('Profile update endpoint is not implemented in the backend yet')),
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

// ─── Organizations (Agents) ──────────────────────────────────────────────────

export const organizationApi = {
  list: () =>
    http.get<any[]>('/organizations'),

  get: (id: string) =>
    http.get<any>(`/organizations/${id}`),

  create: (data: {
    title: string
    commissionType: 'fixed' | 'percentage'
    commissionAmount: number
    agent: { phone: string; email?: string; password: string }
    logo?: string
    place?: string
    description?: string
  }) => http.post<any>('/organizations', data),

  update: (id: string, data: Partial<{
    title: string
    commissionType: string
    commissionAmount: number
    logo: string
    place: string
    description: string
  }>) => http.patch<any>(`/organizations/${id}`, data),

  remove: (id: string) =>
    http.delete(`/organizations/${id}`),
}

// ─── Categories ──────────────────────────────────────────────────────────────

export const categoryApi = {
  list: () =>
    http.get<any[]>('/categories'),

  get: (id: string) =>
    http.get<any>(`/categories/${id}`),

  create: (data: { title: string; image: string }) =>
    http.post<any>('/categories', data),

  update: (id: string, data: Partial<{ title: string; image: string }>) =>
    http.patch<any>(`/categories/${id}`, data),

  remove: (id: string) =>
    http.delete(`/categories/${id}`),
}

export default http
