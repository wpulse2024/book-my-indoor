<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  venue: {
    name: string
    tier?: string
    image: string
  }
  date: string
  timeSlot: string
  totalPrice: string
}>()

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()

type Method = 'bkash' | 'nagad' | 'manual'

// Step: 'booking' | 'confirmed'
const step = ref<'booking' | 'confirmed'>('booking')

const selectedMethod = ref<Method>('bkash')
const transactionId = ref('')
const copied = ref(false)

// Generated booking ID on confirm
const bookingId = ref('')

const paymentMethods: { key: Method; label: string }[] = [
  { key: 'bkash',  label: 'bKash'  },
  { key: 'nagad',  label: 'Nagad'  },
  { key: 'manual', label: 'Manual' },
]

const merchantNumbers: Record<Method, string | null> = {
  bkash:  '+880 1712-345678',
  nagad:  '+880 1819-654321',
  manual: null,
}

const merchantNumber = computed(() => merchantNumbers[selectedMethod.value])

function copyNumber() {
  if (!merchantNumber.value) return
  navigator.clipboard.writeText(merchantNumber.value.replace(/\s/g, ''))
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

function confirm() {
  if (!canConfirm.value) return
  // Generate a booking ID
  bookingId.value = 'KC-' + Math.floor(1000 + Math.random() * 9000) + '-X'
  step.value = 'confirmed'
}

const canConfirm = computed(() =>
  selectedMethod.value === 'manual' || transactionId.value.trim().length >= 6
)

function goToBookings() {
  emit('close')
  router.push({ name: 'my-bookings' })
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background: rgba(15,23,42,0.6); backdrop-filter: blur(6px);"
      @click.self="step === 'confirmed' ? emit('close') : null"
    >

      <!-- ── BOOKING FORM ── -->
      <Transition name="modal" mode="out-in">

        <div v-if="step === 'booking'" key="booking" class="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto">

          <!-- Hero image header -->
          <div class="relative h-48 overflow-hidden flex-shrink-0">
            <img :src="venue.image" :alt="venue.name" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <span v-if="venue.tier" class="absolute top-4 left-4 bg-green-700/90 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
              {{ venue.tier }}
            </span>
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

          <!-- Body -->
          <div class="p-6 space-y-6">

            <!-- Reservation Details -->
            <div>
              <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Reservation Details</p>
              <div class="grid grid-cols-3 gap-3">
                <div class="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <p class="text-blue-700 text-xs font-black uppercase tracking-widest mb-1.5">Date</p>
                  <p class="text-gray-900 font-black text-sm leading-snug">{{ date }}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <p class="text-blue-700 text-xs font-black uppercase tracking-widest mb-1.5">Time Slot</p>
                  <p class="text-gray-900 font-black text-sm leading-snug">{{ timeSlot }}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <p class="text-orange-500 text-xs font-black uppercase tracking-widest mb-1.5">Total Price</p>
                  <p class="text-gray-900 font-black text-xl leading-snug">{{ totalPrice }}</p>
                </div>
              </div>
            </div>

            <!-- Payment Method -->
            <div>
              <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Payment Method</p>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="method in paymentMethods"
                  :key="method.key"
                  @click="selectedMethod = method.key; transactionId = ''"
                  :class="[
                    'flex flex-col items-center justify-center gap-2 rounded-xl py-4 border-2 font-black text-xs uppercase tracking-widest transition-all',
                    selectedMethod === method.key
                      ? 'bg-blue-700 border-blue-700 text-white shadow-md'
                      : 'bg-blue-50 border-blue-50 text-gray-600 hover:border-blue-200'
                  ]"
                >
                  <svg v-if="method.key === 'bkash'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                  <svg v-else-if="method.key === 'nagad'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"/>
                  </svg>
                  {{ method.label }}
                </button>
              </div>
            </div>

            <!-- bKash / Nagad instructions -->
            <div v-if="selectedMethod !== 'manual'" class="space-y-3">
              <div class="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                <div class="w-9 h-9 bg-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                </div>
                <div>
                  <p class="text-gray-900 font-black text-sm mb-1">Instruction: Send Money</p>
                  <p class="text-gray-500 text-sm leading-relaxed">
                    Please send exactly <span class="font-black text-gray-900">{{ totalPrice }}</span> to the number below using the Send Money option in your app.
                  </p>
                </div>
              </div>

              <div class="border border-gray-200 rounded-xl px-4 py-3.5 flex items-center justify-between bg-white">
                <div>
                  <p class="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Merchant Number</p>
                  <p class="text-gray-900 font-black text-base tracking-wide">{{ merchantNumber }}</p>
                </div>
                <button @click="copyNumber" class="flex items-center gap-1.5 text-blue-700 hover:text-blue-800 transition-colors text-xs font-bold">
                  <svg v-if="!copied" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  <svg v-else class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  {{ copied ? 'Copied!' : '' }}
                </button>
              </div>

              <div>
                <p class="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Transaction ID</p>
                <input
                  v-model="transactionId"
                  type="text"
                  placeholder="Enter 10-digit ID (e.g. AX765RFG)"
                  class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  maxlength="20"
                />
              </div>
            </div>

            <!-- Manual -->
            <div v-else class="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
              <div class="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p class="text-gray-900 font-black text-sm mb-1">Pay at Venue</p>
                <p class="text-gray-500 text-sm leading-relaxed">
                  Your slot will be reserved. Please pay <span class="font-black text-gray-900">{{ totalPrice }}</span> in cash at the venue reception before your session starts.
                </p>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="flex items-center gap-3 px-6 pb-6">
            <button @click="emit('close')" class="flex-1 text-gray-500 hover:text-gray-800 font-black text-sm py-4 transition-colors">
              Cancel Booking
            </button>
            <button
              @click="confirm"
              :disabled="!canConfirm"
              :class="[
                'flex-[2] flex items-center justify-center gap-2 font-black text-sm py-4 rounded-2xl transition-all uppercase tracking-wide',
                canConfirm
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

        <!-- ── CONFIRMED SCREEN ── -->
        <div
          v-else
          key="confirmed"
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

            <!-- Heading -->
            <div class="text-center mb-8">
              <h2 class="text-blue-700 font-black text-4xl mb-2">Booking Confirmed!</h2>
              <p class="text-gray-500 text-base">Your court is ready for the hustle.</p>
            </div>

            <!-- Booking card -->
            <div class="bg-white rounded-2xl overflow-hidden shadow-md mb-8">
              <div class="flex flex-col sm:flex-row">
                <!-- Venue image -->
                <div class="relative sm:w-56 flex-shrink-0" style="min-height: 200px;">
                  <img :src="venue.image" :alt="venue.name" class="w-full h-full object-cover" style="min-height: 200px;" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                  <span class="absolute top-3 left-3 bg-green-700/90 text-white text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wide">
                    Active Booking
                  </span>
                  <h3 class="absolute bottom-3 left-3 text-white font-black text-base leading-snug">{{ venue.name }}</h3>
                </div>

                <!-- Details -->
                <div class="flex-1 p-5 space-y-5">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <p class="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Date</p>
                      <p class="text-gray-900 font-black text-base">{{ date }}</p>
                    </div>
                    <div>
                      <p class="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Time Slot</p>
                      <p class="text-gray-900 font-black text-base">{{ timeSlot }}</p>
                    </div>
                    <div>
                      <p class="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Court No.</p>
                      <p class="text-gray-900 font-black text-base">Main Court B4</p>
                    </div>
                    <div>
                      <p class="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Booking ID</p>
                      <p class="text-gray-900 font-black text-base">{{ bookingId }}</p>
                    </div>
                  </div>

                  <!-- Check-in access QR box -->
                  <div class="bg-blue-50 rounded-xl p-4 flex items-center gap-4">
                    <!-- Fake barcode SVG -->
                    <svg class="w-14 h-14 flex-shrink-0" viewBox="0 0 56 56" fill="none">
                      <rect x="2"  y="4" width="4" height="48" fill="#1e293b"/>
                      <rect x="8"  y="4" width="2" height="48" fill="#1e293b"/>
                      <rect x="12" y="4" width="4" height="48" fill="#1e293b"/>
                      <rect x="18" y="4" width="2" height="48" fill="#1e293b"/>
                      <rect x="22" y="4" width="6" height="48" fill="#1e293b"/>
                      <rect x="30" y="4" width="2" height="48" fill="#1e293b"/>
                      <rect x="34" y="4" width="4" height="48" fill="#1e293b"/>
                      <rect x="40" y="4" width="2" height="48" fill="#1e293b"/>
                      <rect x="44" y="4" width="6" height="48" fill="#1e293b"/>
                      <rect x="52" y="4" width="2" height="48" fill="#1e293b"/>
                    </svg>
                    <div>
                      <p class="text-gray-900 font-black text-sm mb-1">Check-in Access</p>
                      <p class="text-gray-500 text-xs leading-relaxed">Present this code at the venue entrance. Access granted 10 minutes prior to your slot.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="grid grid-cols-2 gap-4 mb-5">
              <button
                @click="goToBookings"
                class="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black text-sm py-4 rounded-2xl transition-all shadow-lg shadow-orange-200 uppercase tracking-wide"
              >
                View in My Bookings
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
              <button
                class="flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 font-black text-sm py-4 rounded-2xl transition-all uppercase tracking-wide"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Download Receipt
              </button>
            </div>

            <!-- Support link -->
            <p class="text-center text-gray-400 text-sm">
              Need to change something?
              <a href="#" class="text-blue-700 font-bold hover:underline ml-1">Contact Support</a>
            </p>

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
