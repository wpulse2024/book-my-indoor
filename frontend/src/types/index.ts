// ─── Enums ───────────────────────────────────────────────────────────────────

export type VenueType =
  | 'cricket_turf'
  | 'badminton'
  | 'futsal'
  | 'basketball'
  | 'tennis'
  | 'swimming'
  | 'gym'
  | 'yoga_studio'
  | 'other'

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type PaymentMethod = 'wallet' | 'sslcommerz' | 'stripe'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface PermissionSummary {
  id: string
  name: string
  description?: string
}

export interface UserRole {
  id: string
  name: string
  description?: string
  permissions?: PermissionSummary[]
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  avatar: string | null
  walletBalance: number
  autoCreated: boolean
  roles: UserRole[]
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
}

// ─── Venue ───────────────────────────────────────────────────────────────────

export interface VenueBranch {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  phone: string
}

export interface Venue {
  id: string
  tenantId: string
  name: string
  slug: string
  address: string
  lat: number
  lng: number
  city: string
  area: string
  type: VenueType
  description: string
  coverImage: string | null
  images: string[]
  amenities: string[]
  rating: number
  reviewCount: number
  isActive: boolean
  branches: VenueBranch[]
  distanceKm?: number
  lowestPrice?: number
  createdAt: string
}

// ─── Slots ───────────────────────────────────────────────────────────────────

export interface Slot {
  id: string
  venueId: string
  branchId: string | null
  name: string
  startTime: string   // "08:00"
  endTime: string     // "09:00"
  durationMinutes: number
  basePrice: number
  maxCapacity: number
  isActive: boolean
}

export interface AvailableSlot extends Slot {
  available: boolean
  effectivePrice: number
  pricingRule?: string
}

// ─── Booking ─────────────────────────────────────────────────────────────────

export interface Booking {
  id: string
  userId: string
  slot: Slot
  venue: Venue
  branchId: string | null
  bookingDate: string        // "2024-06-15"
  startTime: string
  endTime: string
  status: BookingStatus
  totalAmount: number
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod | null
  qrToken: string | null
  notes: string | null
  createdAt: string
}

// ─── Wallet ──────────────────────────────────────────────────────────────────

export interface WalletTransaction {
  id: string
  type: 'credit' | 'debit'
  amount: number
  reference: string
  description: string
  createdAt: string
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface VenueFilters {
  search: string
  date: string
  timeFrom: string
  timeTo: string
  type: VenueType | ''
  area: string
  priceMin: number | null
  priceMax: number | null
  lat: number | null
  lng: number | null
  radiusKm: number
}

// ─── API responses ───────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true
  data: T
  message?: string
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}

export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

// ─── Review ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string
  venueId: string
  userId: string
  userName: string
  userAvatar: string | null
  rating: number
  comment: string
  createdAt: string
}
