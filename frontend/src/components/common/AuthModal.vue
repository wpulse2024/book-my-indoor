<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '@/services/api'
import AppButton from './AppButton.vue'

const emit = defineEmits<{ close: [] }>()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

type Step = 'phone' | 'otp' | 'register'
const step = ref<Step>('phone')
const phone = ref('')
const otp = ref('')
const name = ref('')
const email = ref('')
const error = ref('')
const isSending = ref(false)
const countdown = ref(0)

let timer: ReturnType<typeof setInterval>

function startCountdown() {
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) clearInterval(timer)
  }, 1000)
}

async function sendOtp() {
  if (phone.value.length < 11) { error.value = 'Enter a valid phone number'; return }
  error.value = ''
  isSending.value = true
  try {
    await authApi.sendOtp(phone.value)
    step.value = 'otp'
    startCountdown()
  } catch (e: unknown) {
    error.value = (e as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to send OTP'
  } finally {
    isSending.value = false
  }
}

async function verifyOtp() {
  if (otp.value.length < 4) { error.value = 'Enter the OTP'; return }
  error.value = ''
  auth.isLoading = true
  try {
    await auth.loginWithOtp(phone.value, otp.value)
    const redirect = route.query.redirect as string
    emit('close')
    if (redirect) router.push(redirect)
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } }).response?.data?.message
    if (msg === 'USER_NOT_FOUND') {
      step.value = 'register'
    } else {
      error.value = msg ?? 'Invalid OTP'
    }
  } finally {
    auth.isLoading = false
  }
}

async function register() {
  if (!name.value) { error.value = 'Enter your name'; return }
  error.value = ''
  auth.isLoading = true
  try {
    const res = await authApi.register({ name: name.value, email: email.value, phone: phone.value, password: otp.value })
    const store = useAuthStore()
    store.user = res.data.data.user
    store.token = res.data.data.token
    localStorage.setItem('bmi_token', res.data.data.token)
    emit('close')
  } catch (e: unknown) {
    error.value = (e as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Registration failed'
  } finally {
    auth.isLoading = false
  }
}

watch(() => auth.isLoggedIn, (v) => { if (v) emit('close') })
</script>

<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="emit('close')">
      <div class="modal animate-slide-up">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-slate-900">
            <template v-if="step === 'phone'">Sign In / Register</template>
            <template v-else-if="step === 'otp'">Enter OTP</template>
            <template v-else>Complete Registration</template>
          </h2>
          <button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500" @click="emit('close')">✕</button>
        </div>

        <!-- Phone step -->
        <form v-if="step === 'phone'" @submit.prevent="sendOtp">
          <div class="form-group mb-4">
            <label class="form-label">Phone Number</label>
            <input
              v-model="phone"
              type="tel"
              class="form-input"
              placeholder="01XXXXXXXXX"
              autofocus
            />
          </div>
          <p v-if="error" class="text-sm text-red-600 mb-3">{{ error }}</p>
          <AppButton type="submit" :loading="isSending" full>Send OTP</AppButton>
        </form>

        <!-- OTP step -->
        <form v-else-if="step === 'otp'" @submit.prevent="verifyOtp">
          <p class="text-sm text-slate-500 mb-4">OTP sent to <strong>{{ phone }}</strong></p>
          <div class="form-group mb-4">
            <label class="form-label">OTP Code</label>
            <input
              v-model="otp"
              type="text"
              class="form-input text-center text-2xl font-bold tracking-widest"
              placeholder="------"
              maxlength="6"
              autofocus
            />
          </div>
          <p v-if="error" class="text-sm text-red-600 mb-3">{{ error }}</p>
          <AppButton type="submit" :loading="auth.isLoading" full>Verify OTP</AppButton>
          <div class="mt-3 text-center text-sm text-slate-500">
            <template v-if="countdown > 0">Resend in {{ countdown }}s</template>
            <button v-else type="button" class="text-primary-600 font-medium hover:underline" @click="sendOtp">Resend OTP</button>
          </div>
          <button type="button" class="mt-2 text-sm text-slate-400 hover:text-slate-600 w-full text-center" @click="step = 'phone'">← Change number</button>
        </form>

        <!-- Register step -->
        <form v-else @submit.prevent="register">
          <p class="text-sm text-slate-500 mb-4">Looks like you're new! Fill in your details to create an account.</p>
          <div class="form-group mb-3">
            <label class="form-label">Your Name</label>
            <input v-model="name" type="text" class="form-input" placeholder="John Doe" autofocus />
          </div>
          <div class="form-group mb-4">
            <label class="form-label">Email (optional)</label>
            <input v-model="email" type="email" class="form-input" placeholder="you@example.com" />
          </div>
          <p v-if="error" class="text-sm text-red-600 mb-3">{{ error }}</p>
          <AppButton type="submit" :loading="auth.isLoading" full>Create Account & Continue</AppButton>
        </form>
      </div>
    </div>
  </Teleport>
</template>
