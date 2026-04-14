<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '@/services/api'

type LoginStep = 'phone' | 'password' | 'otp'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const step = ref<LoginStep>('phone')
const countryCode = ref('+880')
const phone = ref('')
const password = ref('')
const otp = ref('')
const error = ref('')
const infoMessage = ref('')
const isSubmitting = ref(false)
const otpLoginPreferred = ref(false)
const resendCountdown = ref(0)

let timer: ReturnType<typeof setInterval> | undefined

const normalizedPhone = computed(() => formatPhoneNumber(phone.value, countryCode.value))
const maskedPhone = computed(() => {
  const value = normalizedPhone.value.replace(/\D/g, '')
  if (value.length < 6) return normalizedPhone.value
  return `${countryCode.value} ${value.slice(-10, -7)}-${value.slice(-7, -4)}${value.slice(-4)}`
})

function formatPhoneNumber(input: string, prefix: string) {
  const digits = input.replace(/\D/g, '')

  if (!digits) return ''
  if (digits.startsWith('880')) return `+${digits}`
  if (digits.startsWith('0')) return `+88${digits}`
  if (digits.length === 10) return `${prefix}${digits}`
  return `${prefix}${digits}`
}

function getErrorMessage(cause: unknown, fallback: string) {
  if (axios.isAxiosError(cause)) {
    const message = cause.response?.data?.message
    if (Array.isArray(message)) return message[0] ?? fallback
    if (typeof message === 'string') return message
  }

  if (cause instanceof Error) return cause.message
  return fallback
}

function clearTimer() {
  if (timer) {
    clearInterval(timer)
    timer = undefined
  }
}

function startCountdown(seconds = 45) {
  clearTimer()
  resendCountdown.value = seconds

  timer = setInterval(() => {
    resendCountdown.value -= 1
    if (resendCountdown.value <= 0) {
      clearTimer()
      resendCountdown.value = 0
    }
  }, 1000)
}

function resetMessages() {
  error.value = ''
  infoMessage.value = ''
}

function handleAuthSuccess() {
  if (auth.isAdmin) { router.push('/admin/venues'); return }
  if (auth.hasAgentAccess) { router.push('/agent'); return }
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  router.push(redirect)
}

async function continueWithPhone() {
  if (!normalizedPhone.value) {
    error.value = 'Enter a valid phone number'
    return
  }

  resetMessages()
  isSubmitting.value = true

  try {
    const res = await authApi.validateUser(normalizedPhone.value)
    otpLoginPreferred.value = res.data.isOtpLogin
    step.value = 'password'
  } catch (cause) {
    error.value = getErrorMessage(cause, 'We could not find that user.')
  } finally {
    isSubmitting.value = false
  }
}

async function requestOtp() {
  if (!normalizedPhone.value) {
    error.value = 'Enter a valid phone number'
    return
  }

  resetMessages()
  isSubmitting.value = true

  try {
    await authApi.login({
      identifier: normalizedPhone.value,
      isOtpLogin: true,
    })
    step.value = 'otp'
    otp.value = ''
    startCountdown()
    infoMessage.value = 'A 6-digit verification code has been sent.'
  } catch (cause) {
    error.value = getErrorMessage(cause, 'Unable to send OTP right now.')
  } finally {
    isSubmitting.value = false
  }
}

async function submitPassword() {
  if (!password.value.trim()) {
    error.value = 'Enter your password'
    return
  }

  resetMessages()

  try {
    await auth.loginWithPassword(normalizedPhone.value, password.value)
    handleAuthSuccess()
  } catch (cause) {
    error.value = getErrorMessage(cause, 'Invalid phone number or password.')
  }
}

async function submitOtp() {
  if (otp.value.trim().length !== 6) {
    error.value = 'Enter the 6-digit OTP'
    return
  }

  resetMessages()

  try {
    await auth.loginWithOtp(normalizedPhone.value, otp.value)
    handleAuthSuccess()
  } catch (cause) {
    error.value = getErrorMessage(cause, 'Invalid OTP.')
  }
}

function backToPhone() {
  resetMessages()
  password.value = ''
  otp.value = ''
  step.value = 'phone'
  otpLoginPreferred.value = false
  clearTimer()
}

onBeforeUnmount(() => {
  clearTimer()
})
</script>

<template>
  <div class="login-shell">
    <header class="login-shell__topbar">
      <RouterLink to="/" class="login-shell__brand">VenueFlow</RouterLink>
      <a href="#" class="login-shell__support">Support</a>
    </header>

    <main class="login-shell__main">
      <section class="login-card">
        <div v-if="step === 'phone'" class="login-card__body">
          <p class="login-card__eyebrow">Secure venue access</p>
          <h1 class="login-card__title">Welcome Back</h1>
          <p class="login-card__subtitle">Enter your phone number to continue.</p>

          <form class="login-form" @submit.prevent="continueWithPhone">
            <label class="login-form__label">Phone Number</label>
            <div class="phone-input">
              <select v-model="countryCode" class="phone-input__prefix">
                <option value="+880">+880</option>
              </select>
              <input
                v-model="phone"
                class="phone-input__field"
                type="tel"
                inputmode="numeric"
                autocomplete="tel"
                placeholder="1XXX XXXXXX"
                autofocus
              />
            </div>

            <p v-if="error" class="login-form__message login-form__message--error">{{ error }}</p>
            <p v-else-if="infoMessage" class="login-form__message">{{ infoMessage }}</p>

            <button class="login-form__primary" type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Checking...' : 'Continue' }}
            </button>
          </form>
        </div>

        <div v-else-if="step === 'password'" class="login-card__body">
          <p class="login-card__eyebrow">Welcome back</p>
          <h1 class="login-card__title">Sign In</h1>
          <p class="login-card__subtitle">
            Signing in as <strong>{{ normalizedPhone }}</strong> &mdash;
            <button class="login-form__link" type="button" @click="backToPhone">Change</button>
          </p>

          <p v-if="error" class="login-form__message login-form__message--error" style="margin-top:1.25rem;">{{ error }}</p>
          <p v-else-if="infoMessage" class="login-form__message" style="margin-top:1.25rem;">{{ infoMessage }}</p>

          <form class="login-form" @submit.prevent="submitPassword">
            <label class="login-form__label">Password</label>

            <input
              v-model="password"
              class="login-form__field"
              type="password"
              autocomplete="current-password"
              placeholder="Enter your password"
              autofocus
            />

            <button class="login-form__primary" type="submit" :disabled="auth.isLoading">
              {{ auth.isLoading ? 'Signing In...' : 'Sign In with Password' }}
            </button>
          </form>

          <div class="login-divider">
            <span>or</span>
          </div>

          <button class="login-form__secondary" type="button" :disabled="isSubmitting" @click="requestOtp">
            {{ isSubmitting ? 'Sending OTP...' : 'Sign In with OTP' }}
          </button>
        </div>

        <div v-else class="login-card__body login-card__body--otp">
          <div class="otp-badge">✓</div>
          <p class="login-card__eyebrow">Verification required</p>
          <h1 class="login-card__title">Verify OTP</h1>
          <p class="login-card__subtitle">
            We sent a 6-digit code to <strong>{{ maskedPhone }}</strong>
          </p>

          <form class="login-form" @submit.prevent="submitOtp">
            <input
              v-model="otp"
              class="login-form__field login-form__field--otp"
              type="text"
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength="6"
              placeholder="000000"
              autofocus
            />

            <p v-if="error" class="login-form__message login-form__message--error">{{ error }}</p>
            <p v-else-if="infoMessage" class="login-form__message">{{ infoMessage }}</p>

            <button class="login-form__primary" type="submit" :disabled="auth.isLoading">
              {{ auth.isLoading ? 'Verifying...' : 'Verify & Login' }}
            </button>
          </form>

          <div class="otp-actions">
            <button class="login-form__link" type="button" :disabled="isSubmitting || resendCountdown > 0" @click="requestOtp">
              {{ resendCountdown > 0 ? `Resend in 00:${String(resendCountdown).padStart(2, '0')}` : 'Resend Code' }}
            </button>
            <button class="login-form__link" type="button" @click="backToPhone">Back to Login</button>
          </div>

          <p v-if="otpLoginPreferred" class="login-form__hint">This account uses OTP as the primary sign-in method.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped lang="scss">
.login-shell {
  min-height: 100vh;
  padding: 2rem 2.5rem;
  background:
    radial-gradient(circle at top right, rgb(99 102 241 / 0.12), transparent 22rem),
    radial-gradient(circle at bottom left, rgb(59 130 246 / 0.08), transparent 20rem),
    linear-gradient(90deg, #f8fafc 0%, #eef2ff 52%, #f8fafc 100%);
  color: #0f172a;
  font-family: Inter, system-ui, sans-serif;

  &__topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  &__brand {
    font-size: 1rem;
    font-weight: 800;
    color: #0f172a;
    text-decoration: none;
    letter-spacing: -0.04em;
  }

  &__support {
    color: #4f46e5;
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 600;
  }

  &__main {
    min-height: calc(100vh - 5rem);
    display: grid;
    place-items: center;
  }
}

.login-card {
  width: min(100%, 34rem);
  border-radius: 1.75rem;
  border: 1px solid rgb(148 163 184 / 0.18);
  background: rgb(255 255 255 / 0.84);
  box-shadow: 0 28px 90px rgb(79 70 229 / 0.12);
  backdrop-filter: blur(18px);

  &__body {
    padding: 3rem;
  }

  &__body--otp {
    text-align: center;
  }

  &__eyebrow {
    margin: 0 0 0.75rem;
    color: #6366f1;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  &__title {
    margin: 0;
    font-size: clamp(2.2rem, 5vw, 3.2rem);
    line-height: 0.95;
    font-weight: 900;
    letter-spacing: -0.06em;
  }

  &__subtitle {
    margin: 1rem 0 0;
    color: #475569;
    font-size: 1.05rem;
    line-height: 1.7;
  }
}

.login-form {
  margin-top: 2rem;

  &__label {
    display: block;
    margin-bottom: 0.8rem;
    color: #312e81;
    font-size: 0.9rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__field {
    width: 100%;
    height: 4rem;
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    background: #f8fafc;
    padding: 0 1.2rem;
    font-size: 1.05rem;
    color: #0f172a;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

    &:focus {
      border-color: #6366f1;
      background: #fff;
      box-shadow: 0 0 0 4px rgb(99 102 241 / 0.14);
    }
  }

  &__field--otp {
    text-align: center;
    letter-spacing: 0.55em;
    font-size: 1.8rem;
    font-weight: 800;
    padding-left: 1.7rem;
  }

  &__primary,
  &__secondary {
    width: 100%;
    min-height: 4rem;
    border: 0;
    border-radius: 1rem;
    font-size: 1.1rem;
    font-weight: 800;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.7;
      transform: none;
      box-shadow: none;
    }
  }

  &__primary {
    margin-top: 1.5rem;
    background: linear-gradient(135deg, #312e81 0%, #4f46e5 52%, #6366f1 100%);
    color: #fff;
    box-shadow: 0 18px 32px rgb(79 70 229 / 0.28);

    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }
  }

  &__secondary {
    background: #eef2ff;
    color: #312e81;
  }

  &__message {
    margin: 1rem 0 0;
    color: #475569;
    font-size: 0.95rem;
  }

  &__message--error {
    color: #dc2626;
  }

  &__hint {
    margin: 0.9rem 0 0;
    color: #64748b;
    font-size: 0.92rem;
  }

  &__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  &__link {
    border: 0;
    background: transparent;
    padding: 0;
    color: #4f46e5;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
  }
}

.phone-input {
  display: grid;
  grid-template-columns: 6.25rem 1fr;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  overflow: hidden;
  background: #f8fafc;

  &:focus-within {
    border-color: #6366f1;
    background: #fff;
    box-shadow: 0 0 0 4px rgb(99 102 241 / 0.14);
  }

  &__prefix,
  &__field {
    height: 4rem;
    border: 0;
    background: transparent;
    font-size: 1.05rem;
    color: #0f172a;
    outline: none;
  }

  &__prefix {
    padding: 0 1rem;
    border-right: 1px solid #e2e8f0;
    font-weight: 700;
  }

  &__field {
    padding: 0 1.1rem;
  }
}

.login-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
  color: #94a3b8;
  text-transform: uppercase;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.12em;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e2e8f0;
  }
}

.otp-badge {
  width: 4.5rem;
  height: 4.5rem;
  display: grid;
  place-items: center;
  margin: 0 auto 1.5rem;
  border-radius: 1.25rem;
  background: linear-gradient(180deg, #eef2ff 0%, #e0e7ff 100%);
  color: #4338ca;
  font-size: 2rem;
  font-weight: 900;
}

.otp-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

@media (max-width: 640px) {
  .login-shell {
    padding: 1.25rem;

    &__topbar {
      align-items: flex-start;
    }
  }

  .login-card__body {
    padding: 2rem 1.4rem;
  }

  .login-form__meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
