<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { bookingApi, authApi } from '@/services/api'
import http from '@/services/api'

const props = defineProps<{
  venue: { id: string; name: string; image: string }
  slotId: string
  bookingDate: string
  slot: { startTime: string; endTime: string; price: number }
}>()

const emit = defineEmits<{ close: [] }>()

const router = useRouter()
const authStore = useAuthStore()

type Step = 'guest-info' | 'otp' | 'payment' | 'booking' | 'success'
type PaymentMethod = 'cash' | 'bkash' | 'nagad'

const step = ref<Step>(authStore.isLoggedIn ? 'payment' : 'guest-info')

// Guest info
const guestName = ref('')
const phone = ref('')
const isNewUser = ref(false)
const guestError = ref('')
const sendingOtp = ref(false)

// OTP
const otp = ref('')
const otpError = ref('')
const verifyingOtp = ref(false)
const countdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

// Payment
const paymentMethod = ref<PaymentMethod>('cash')
const transactionId = ref('')
const copied = ref(false)
const bookingError = ref('')

// Success
const bookingRef = ref('')

const merchantNumbers: Record<string, string> = {
  bkash: '+880 1712-345678',
  nagad: '+880 1819-654321',
}

function formatTime(t: string): string {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

const timeSlotLabel = computed(() =>
  `${formatTime(props.slot.startTime)} – ${formatTime(props.slot.endTime)}`
)

const formattedDate = computed(() => {
  if (!props.bookingDate) return ''
  const d = new Date(props.bookingDate + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
})

const canConfirmBooking = computed(() => {
  if (paymentMethod.value === 'cash') return true
  return transactionId.value.trim().length >= 6
})

function startCountdown(seconds: number) {
  countdown.value = seconds
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

async function handleSendOtp() {
  if (!guestName.value.trim() || guestName.value.trim().length < 2) {
    guestError.value = 'Please enter your full name (at least 2 characters)'
    return
  }
  if (!phone.value.trim()) {
    guestError.value = 'Please enter your phone number'
    return
  }
  guestError.value = ''
  sendingOtp.value = true
  try {
    try {
      await authApi.validateUser(phone.value)
      // Existing user → send OTP via login
      await authApi.login({ identifier: phone.value, isOtpLogin: true })
      isNewUser.value = false
    } catch (err: any) {
      if (err.response?.status === 404) {
        // New user → register and send OTP
        await http.post('/auth/register', { phone: phone.value })
        isNewUser.value = true
      } else {
        throw err
      }
    }
    startCountdown(45)
    step.value = 'otp'
  } catch (err: any) {
    guestError.value = err.response?.data?.message ?? 'Failed to send OTP. Please try again.'
  } finally {
    sendingOtp.value = false
  }
}

async function handleVerifyOtp() {
  if (!otp.value || otp.value.length < 4) {
    otpError.value = 'Please enter the OTP'
    return
  }
  otpError.value = ''
  verifyingOtp.value = true
  try {
    let accessToken: string
    let userData: any
    if (isNewUser.value) {
      const res = await http.post<{ accessToken: string; user: any }>('/auth/verify-otp/register', {
        phone: phone.value,
        otp: otp.value,
      })
      accessToken = res.data.accessToken
      userData = res.data.user
    } else {
      const res = await authApi.verifyLoginOtp(phone.value, otp.value)
      accessToken = res.data.accessToken
      userData = res.data.user
    }
    authStore.setSession(accessToken, userData ?? { phone: phone.value })
    step.value = 'payment'
  } catch (err: any) {
    otpError.value = err.response?.data?.message ?? 'Invalid OTP. Please try again.'
  } finally {
    verifyingOtp.value = false
  }
}

async function handleResendOtp() {
  if (countdown.value > 0) return
  sendingOtp.value = true
  try {
    if (isNewUser.value) {
      await http.post('/auth/register', { phone: phone.value })
    } else {
      await authApi.login({ identifier: phone.value, isOtpLogin: true })
    }
    startCountdown(45)
    otpError.value = ''
  } catch {
    otpError.value = 'Failed to resend OTP. Please try again.'
  } finally {
    sendingOtp.value = false
  }
}

function copyNumber(number: string) {
  navigator.clipboard.writeText(number.replace(/\s/g, ''))
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

async function handleConfirmBooking() {
  bookingError.value = ''
  step.value = 'booking'
  try {
    const res = await bookingApi.create({
      venueId: props.venue.id,
      slotId: props.slotId,
      bookingDate: props.bookingDate,
      paymentMethod: paymentMethod.value,
      guestName: guestName.value || authStore.user?.name,
      transactionId: paymentMethod.value !== 'cash' ? transactionId.value : undefined,
    })
    bookingRef.value = res.data?.bookingRef ?? res.data?.data?.bookingRef ?? ''
    step.value = 'success'
  } catch (err: any) {
    bookingError.value = err.response?.data?.message ?? 'Failed to create booking. Please try again.'
    step.value = 'payment'
  }
}

function goToBookings() {
  emit('close')
  router.push({ name: 'my-bookings' })
}

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background: rgba(15,23,42,0.6); backdrop-filter: blur(6px);"
      @click.self="step === 'success' ? emit('close') : null"
    >
      <Transition name="modal" mode="out-in">

        <!-- STEP: guest-info -->
        <div v-if="step === 'guest-info'" key="guest-info" class="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md">
          <div class="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 class="font-black text-gray-900 text-xl">Reserve Your Slot</h2>
              <p class="text-gray-400 text-sm mt-0.5">We'll send a code to verify your number</p>
            </div>
            <button
              @click="emit('close')"
              class="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-4">
            <!-- Slot summary -->
            <div class="bg-blue-50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p class="text-blue-700 font-black text-sm">{{ venue.name }}</p>
                <p class="text-gray-500 text-xs mt-0.5">{{ formattedDate }} · {{ timeSlotLabel }}</p>
              </div>
              <p class="text-gray-900 font-black text-lg">৳{{ slot.price.toLocaleString() }}</p>
            </div>

            <!-- Name -->
            <div>
              <label class="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Your Name</label>
              <input
                v-model="guestName"
                type="text"
                placeholder="Enter your full name"
                maxlength="100"
                class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <!-- Phone -->
            <div>
              <label class="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Phone Number</label>
              <input
                v-model="phone"
                type="tel"
                placeholder="e.g. 01711234567"
                maxlength="15"
                class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
              <p class="text-gray-400 text-xs mt-1.5">We'll send a one-time code to this number</p>
            </div>

            <div v-if="guestError" class="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm">
              {{ guestError }}
            </div>
          </div>

          <div class="px-6 pb-6">
            <button
              @click="handleSendOtp"
              :disabled="sendingOtp"
              class="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-sm py-4 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
            >
              <svg v-if="sendingOtp" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ sendingOtp ? 'Sending…' : 'Send OTP' }}
            </button>
          </div>
        </div>

        <!-- STEP: otp -->
        <div v-else-if="step === 'otp'" key="otp" class="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md">
          <div class="px-6 pt-6 pb-4 border-b border-gray-100">
            <button
              @click="step = 'guest-info'"
              class="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm font-bold mb-3 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
            <h2 class="font-black text-gray-900 text-xl">Verify Your Number</h2>
            <p class="text-gray-400 text-sm mt-0.5">Enter the code sent to <span class="font-bold text-gray-600">{{ phone }}</span></p>
          </div>

          <div class="p-6 space-y-4">
            <input
              v-model="otp"
              type="text"
              placeholder="• • • • • •"
              autofocus
              maxlength="6"
              class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-700 placeholder-gray-300 outline-none focus:border-blue-500 focus:bg-white transition-colors text-center text-2xl tracking-[0.4em] font-black"
            />

            <div v-if="otpError" class="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm">
              {{ otpError }}
            </div>

            <p class="text-center text-sm text-gray-400">
              <span v-if="countdown > 0">Resend in {{ countdown }}s</span>
              <button
                v-else
                @click="handleResendOtp"
                :disabled="sendingOtp"
                class="text-blue-700 font-bold hover:underline disabled:opacity-50"
              >
                Resend OTP
              </button>
            </p>
          </div>

          <div class="px-6 pb-6">
            <button
              @click="handleVerifyOtp"
              :disabled="verifyingOtp"
              class="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-sm py-4 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
            >
              <svg v-if="verifyingOtp" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ verifyingOtp ? 'Verifying…' : 'Verify OTP' }}
            </button>
          </div>
        </div>

        <!-- STEP: payment -->
        <div v-else-if="step === 'payment'" key="payment" class="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto">
          <!-- Hero image header -->
          <div class="relative h-48 overflow-hidden flex-shrink-0">
            <img :src="venue.image" :alt="venue.name" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <h2 class="absolute bottom-4 left-4 text-white font-black text-xl leading-tight">{{ venue.name }}</h2>
            <button
              @click="emit('close')"
              class="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-6">
            <!-- Reservation Details -->
            <div>
              <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Reservation Details</p>
              <div class="grid grid-cols-3 gap-3">
                <div class="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <p class="text-blue-700 text-xs font-black uppercase tracking-widest mb-1.5">Date</p>
                  <p class="text-gray-900 font-black text-sm leading-snug">{{ formattedDate }}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <p class="text-blue-700 text-xs font-black uppercase tracking-widest mb-1.5">Time</p>
                  <p class="text-gray-900 font-black text-sm leading-snug">{{ timeSlotLabel }}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <p class="text-orange-500 text-xs font-black uppercase tracking-widest mb-1.5">Price</p>
                  <p class="text-gray-900 font-black text-xl leading-snug">৳{{ slot.price.toLocaleString() }}</p>
                </div>
              </div>
            </div>

            <!-- Payment Method -->
            <div>
              <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Payment Method</p>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="method in (['cash', 'bkash', 'nagad'] as PaymentMethod[])"
                  :key="method"
                  @click="paymentMethod = method; transactionId = ''"
                  :class="[
                    'flex flex-col items-center justify-center gap-2 rounded-xl py-4 border-2 font-black text-xs uppercase tracking-widest transition-all',
                    paymentMethod === method
                      ? 'bg-blue-700 border-blue-700 text-white shadow-md'
                      : 'bg-blue-50 border-blue-50 text-gray-600 hover:border-blue-200'
                  ]"
                >
                  {{ method === 'cash' ? 'Cash' : method === 'bkash' ? 'bKash' : 'Nagad' }}
                </button>
              </div>
            </div>

            <!-- bKash / Nagad details -->
            <div v-if="paymentMethod !== 'cash'" class="space-y-3">
              <div class="border border-gray-200 rounded-xl px-4 py-3.5 flex items-center justify-between bg-white">
                <div>
                  <p class="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Merchant Number</p>
                  <p class="text-gray-900 font-black text-base tracking-wide">{{ merchantNumbers[paymentMethod] }}</p>
                </div>
                <button
                  @click="copyNumber(merchantNumbers[paymentMethod])"
                  class="flex items-center gap-1.5 text-blue-700 hover:text-blue-800 transition-colors text-xs font-bold"
                >
                  <svg v-if="!copied" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  <svg v-else class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  {{ copied ? 'Copied!' : 'Copy' }}
                </button>
              </div>
              <div>
                <p class="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Transaction ID</p>
                <input
                  v-model="transactionId"
                  type="text"
                  placeholder="Enter transaction ID (min 6 chars)"
                  maxlength="30"
                  class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <!-- Cash -->
            <div v-else class="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
              <div class="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p class="text-gray-900 font-black text-sm mb-1">Pay at Venue</p>
                <p class="text-gray-500 text-sm leading-relaxed">
                  Your slot will be reserved. Please pay <span class="font-black text-gray-900">৳{{ slot.price.toLocaleString() }}</span> in cash at the venue reception before your session starts.
                </p>
              </div>
            </div>

            <div v-if="bookingError" class="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm">
              {{ bookingError }}
            </div>
          </div>

          <div class="flex items-center gap-3 px-6 pb-6">
            <button
              @click="emit('close')"
              class="flex-1 text-gray-500 hover:text-gray-800 font-black text-sm py-4 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="handleConfirmBooking"
              :disabled="!canConfirmBooking"
              :class="[
                'flex-[2] flex items-center justify-center gap-2 font-black text-sm py-4 rounded-2xl transition-all uppercase tracking-wide',
                canConfirmBooking
                  ? 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white shadow-lg shadow-orange-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              ]"
            >
              Confirm Booking
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- STEP: booking (loading) -->
        <div v-else-if="step === 'booking'" key="booking" class="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-12 flex flex-col items-center gap-6">
          <div class="w-16 h-16 rounded-full border-4 border-blue-700 border-t-transparent animate-spin"></div>
          <div class="text-center">
            <p class="font-black text-gray-900 text-lg mb-1">Reserving your slot…</p>
            <p class="text-gray-400 text-sm">Please don't close this window.</p>
          </div>
        </div>

        <!-- STEP: success -->
        <div
          v-else
          key="success"
          class="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
          style="background: linear-gradient(145deg, #eef2ff 0%, #f8faff 50%, #fff0f5 100%);"
        >
          <div class="px-10 py-12">
            <!-- Check icon -->
            <div class="flex justify-center mb-6">
              <div class="w-20 h-20 rounded-full bg-lime-400 flex items-center justify-center shadow-lg shadow-lime-200">
                <svg class="w-10 h-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            </div>

            <div class="text-center mb-8">
              <h2 class="text-blue-700 font-black text-4xl mb-2">Booking Confirmed!</h2>
              <p class="text-gray-500 text-base">Your slot is reserved.</p>
              <div class="mt-4 inline-block bg-white rounded-xl px-6 py-3 shadow-sm border border-gray-100">
                <p class="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Booking Reference</p>
                <p class="text-blue-700 font-black text-2xl tracking-wide">{{ bookingRef }}</p>
              </div>
            </div>

            <!-- Summary card -->
            <div class="bg-white rounded-2xl overflow-hidden shadow-md mb-8">
              <div class="flex flex-col sm:flex-row">
                <div class="relative sm:w-48 flex-shrink-0" style="min-height: 180px;">
                  <img :src="venue.image" :alt="venue.name" class="w-full h-full object-cover" style="min-height: 180px;" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                  <h3 class="absolute bottom-3 left-3 text-white font-black text-sm leading-snug">{{ venue.name }}</h3>
                </div>
                <div class="flex-1 p-5 space-y-3">
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <p class="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Date</p>
                      <p class="text-gray-900 font-black text-sm">{{ formattedDate }}</p>
                    </div>
                    <div>
                      <p class="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Time</p>
                      <p class="text-gray-900 font-black text-sm">{{ timeSlotLabel }}</p>
                    </div>
                    <div>
                      <p class="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Price</p>
                      <p class="text-gray-900 font-black text-sm">৳{{ slot.price.toLocaleString() }}</p>
                    </div>
                    <div>
                      <p class="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Payment</p>
                      <p class="text-gray-900 font-black text-sm capitalize">{{ paymentMethod }}</p>
                    </div>
                  </div>
                  <p v-if="isNewUser" class="text-gray-400 text-xs pt-2 border-t border-gray-100">
                    Your account is ready — log in with your phone anytime.
                  </p>
                </div>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="grid grid-cols-2 gap-4">
              <button
                @click="goToBookings"
                class="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black text-sm py-4 rounded-2xl transition-all shadow-lg shadow-orange-200 uppercase tracking-wide"
              >
                View My Bookings
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
              <button
                @click="emit('close')"
                class="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-sm py-4 rounded-2xl transition-all uppercase tracking-wide"
              >
                Close
              </button>
            </div>
          </div>
        </div>

      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: all 0.25s ease;
}
.modal-enter-from {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
}
.modal-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(-8px);
}
</style>
