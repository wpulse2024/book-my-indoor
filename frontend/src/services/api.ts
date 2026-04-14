import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type {
  ApiSuccess,
  User,
  Venue,
  AvailableSlot,
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

const backendOrigin = (() => {
  const base = import.meta.env.VITE_BACKEND_BASE_URL ?? 'http://localhost:8000/'
  return base.replace(/\/$/, '')
})()

/** Resolves a DB-stored relative path (e.g. "uploads/categories/x.jpg") to a full URL. */
export function assetUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${backendOrigin}/${path.replace(/^\//, '')}`
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

  updateProfile: (data: { name?: string; email?: string }) =>
    http.patch<Partial<User>>('/auth/profile', data),
}

// ─── Venues ──────────────────────────────────────────────────────────────────

export const venueApi = {
  list: (filters: Partial<VenueFilters> & { page?: number; perPage?: number }) =>
    http.get<ApiSuccess<PaginatedData<Venue>>>('/user/venues', { params: filters }),

  nearby: (lat: number, lng: number, radiusKm = 10) =>
    http.get<ApiSuccess<Venue[]>>('/user/venues/nearby', { params: { lat, lng, radius: radiusKm } }),

  get: (slug: string) =>
    http.get<ApiSuccess<Venue>>(`/user/venues/${slug}`),

  availableSlots: (venueId: string, date: string) =>
    http.get<ApiSuccess<AvailableSlot[]>>(`/venue-slots/public`, { params: { venueId, date } }),

  reviews: (venueId: string, page = 1) =>
    http.get<ApiSuccess<PaginatedData<Review>>>(`/venues/${venueId}/reviews`, { params: { page } }),
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export const bookingApi = {
  create: (data: {
    venueId: string
    slotId: string
    bookingDate: string
    paymentMethod: string
    guestName?: string
    transactionId?: string
    notes?: string
  }) =>
    http.post<any>('/bookings', data),

  list: (page = 1) =>
    http.get<any>('/bookings', { params: { page } }),

  get: (id: string) =>
    http.get<any>(`/bookings/${id}`),

  getByRef: (ref: string) =>
    http.get<any>(`/bookings/${ref}`),

  cancel: (id: string) =>
    http.delete<any>(`/bookings/${id}`),

  postReview: (data: { venueId: string; bookingId: string; rating: number; comment: string; isAnonymous?: boolean }) =>
    http.post<ApiSuccess<Review>>('/reviews', data),
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

// ─── Agent Bookings ───────────────────────────────────────────────────────────

export const agentBookingApi = {
  list: (page = 1) =>
    http.get<any>('/bookings/agent', { params: { page } }),

  updateStatus: (id: string, status: string) =>
    http.patch<any>(`/bookings/${id}/status`, { status }),
}

// ─── Admin Bookings ───────────────────────────────────────────────────────────

export const adminBookingApi = {
  list: (page = 1, status?: string) =>
    http.get<any>('/bookings/all', { params: { page, ...(status ? { status } : {}) } }),
}

// ─── Organizations (Agents) ──────────────────────────────────────────────────

export const organizationApi = {
  selfRegister: (data: {
    title: string
    ownerName: string
    phone: string
    email: string
    password: string
  }) => http.post<any>('/organizations/register', data),

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

  approve: (id: string) =>
    http.patch<any>(`/organizations/${id}/approve`),

  remove: (id: string) =>
    http.delete(`/organizations/${id}`),
}

// ─── Roles ────────────────────────────────────────────────────────────────────

export const rolesApi = {
  list: () =>
    http.get<any[]>('/roles'),

  listNonAdmin: () =>
    http.get<any[]>('/roles/non-admin'),

  create: (data: { name: string; description?: string; permissions?: string[] }) =>
    http.post<any>('/roles', data),

  update: (id: string, data: { name?: string; description?: string; permissions?: string[] }) =>
    http.patch<any>(`/roles/${id}`, data),

  remove: (id: string) =>
    http.delete(`/roles/${id}`),
}

// ─── Permissions ──────────────────────────────────────────────────────────────

export const permissionsApi = {
  list: () =>
    http.get<any[]>('/permissions'),
}

// ─── Staff (agent manages own org's staff) ───────────────────────────────────

export const staffApi = {
  list: () =>
    http.get<any[]>('/organizations/my-staff'),

  create: (data: { name: string; phone: string; email?: string; password: string; roleId?: string }) =>
    http.post<any>('/organizations/staff', data),

  remove: (staffUserId: string) =>
    http.delete(`/organizations/staff/${staffUserId}`),
}

// ─── Categories ──────────────────────────────────────────────────────────────

export const categoryApi = {
  list: () =>
    http.get<any[]>('/categories'),

  get: (id: string) =>
    http.get<any>(`/categories/${id}`),

  create: (data: FormData) =>
    http.post<any>('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  update: (id: string, data: FormData) =>
    http.patch<any>(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  remove: (id: string) =>
    http.delete(`/categories/${id}`),
}

// ─── Agent Slot Management ────────────────────────────────────────────────────

export const agentSlotApi = {
  list: (query?: {
    venueId?: string
    date?: string
    status?: string
    bookingStatus?: string
    page?: number
    limit?: number
  }) => http.get<any>('/venue-slots/mine', { params: query }),

  get: (id: string) =>
    http.get<any>(`/venue-slots/${id}`),

  create: (data: {
    venueId: string
    date: string
    startTime: string
    endTime: string
    slotPrice: number
    status?: string
  }) => http.post<any>('/venue-slots', data),

  createBulk: (data: { venueId: string; startDate: string; endDate: string; slotPrice?: number }) =>
    http.post<any>('/venue-slots/bulk', data),

  updateStatus: (id: string, status: 'publish' | 'unpublish') =>
    http.patch<any>(`/venue-slots/${id}/status`, { status }),

  update: (id: string, data: Partial<{
    venueId: string
    date: string
    startTime: string
    endTime: string
    slotPrice: number
  }>) => http.patch<any>(`/venue-slots/${id}`, data),

  updatePrice: (id: string, slotPrice: number) =>
    http.patch<any>(`/venue-slots/${id}/price`, { slotPrice }),

  bulkUpdate: (data: { ids: string[]; slotPrice?: number }) =>
    http.patch<any>('/venue-slots/bulk', data),

  bulkUpdateStatus: (data: { ids: string[]; status: 'publish' | 'unpublish' }) =>
    http.patch<any>('/venue-slots/bulk/status', data),

  bulkDelete: (data: { ids: string[] }) =>
    http.delete<any>('/venue-slots/bulk', { data }),

  bookByAgent: (id: string, userPhone: string) =>
    http.post<any>(`/venue-slots/${id}/book`, { userPhone }),

  remove: (id: string) =>
    http.delete(`/venue-slots/${id}`),
}

// ─── Wishlist ────────────────────────────────────────────────────────────────

export const wishlistApi = {
  list: () => http.get<any[]>('/auth/wishlist'),
  add: (venueId: string) => http.post<{ wishlisted: boolean }>(`/auth/wishlist/${venueId}`),
  remove: (venueId: string) => http.delete<{ wishlisted: boolean }>(`/auth/wishlist/${venueId}`),
}

// ─── Agent Venue Management ───────────────────────────────────────────────────

export const agentVenueApi = {
  list: () =>
    http.get<any[]>('/venues/mine'),

  create: (data: FormData) =>
    http.post<any>('/venues', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  update: (id: string, data: FormData) =>
    http.patch<any>(`/venues/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  remove: (id: string) =>
    http.delete(`/venues/${id}`),
}

// ─── Venue Features ──────────────────────────────────────────────────────────

export const venueFeatureApi = {
  list: () =>
    http.get<any[]>('/venue-features'),

  get: (id: string) =>
    http.get<any>(`/venue-features/${id}`),

  create: (data: { name: string; icon: string }) =>
    http.post<any>('/venue-features', data),

  update: (id: string, data: { name?: string; icon?: string }) =>
    http.patch<any>(`/venue-features/${id}`, data),

  remove: (id: string) =>
    http.delete(`/venue-features/${id}`),
}

export default http
