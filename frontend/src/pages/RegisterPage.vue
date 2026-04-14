<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import axios from 'axios'
import { organizationApi } from '@/services/api'

type RegisterStep = 'form' | 'success'

const step = ref<RegisterStep>('form')
const isSubmitting = ref(false)
const error = ref('')

const countryCode = ref('+880')
const orgName = ref('')
const ownerName = ref('')
const phone = ref('')
const email = ref('')
const password = ref('')

const normalizedPhone = computed(() => {
  const digits = phone.value.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('880')) return `+${digits}`
  if (digits.startsWith('0')) return `+88${digits}`
  if (digits.length === 10) return `${countryCode.value}${digits}`
  return `${countryCode.value}${digits}`
})

function getErrorMessage(cause: unknown, fallback: string) {
  if (axios.isAxiosError(cause)) {
    const message = cause.response?.data?.message
    if (Array.isArray(message)) return message[0] ?? fallback
    if (typeof message === 'string') return message
  }
  if (cause instanceof Error) return cause.message
  return fallback
}

async function handleSubmit() {
  error.value = ''

  if (!orgName.value.trim()) { error.value = 'Organization name is required'; return }
  if (!ownerName.value.trim()) { error.value = 'Your name is required'; return }
  if (!normalizedPhone.value) { error.value = 'Enter a valid phone number'; return }
  if (!email.value.trim()) { error.value = 'Email address is required'; return }
  if (password.value.length < 6) { error.value = 'Password must be at least 6 characters'; return }

  isSubmitting.value = true
  try {
    await organizationApi.selfRegister({
      title: orgName.value.trim(),
      ownerName: ownerName.value.trim(),
      phone: normalizedPhone.value,
      email: email.value.trim(),
      password: password.value,
    })
    step.value = 'success'
  } catch (cause) {
    error.value = getErrorMessage(cause, 'Something went wrong. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="register-shell">
    <header class="register-shell__topbar">
      <RouterLink to="/" class="register-shell__brand">VenueFlow</RouterLink>
      <a href="#" class="register-shell__support">Support</a>
    </header>

    <main class="register-shell__main">
      <!-- ── Success State ────────────────────────────────────────────────── -->
      <section v-if="step === 'success'" class="register-card">
        <div class="register-card__body register-card__body--center">
          <div class="success-badge">✓</div>
          <p class="register-card__eyebrow">Application Submitted</p>
          <h1 class="register-card__title">You're on the list!</h1>
          <p class="register-card__subtitle">
            Thank you for registering your venue. Our team will review your application
            and verify your details. You will be able to log in to your dashboard
            <strong>within 24 hours</strong> of approval.
          </p>
          <p class="register-card__notice">
            We'll notify you via phone and email once your account is active.
          </p>
          <div class="success-actions">
            <RouterLink to="/" class="register-form__primary">Back to Home</RouterLink>
            <RouterLink to="/login" class="register-form__secondary">Go to Login</RouterLink>
          </div>
        </div>
      </section>

      <!-- ── Registration Form ───────────────────────────────────────────── -->
      <section v-else class="register-card">
        <div class="register-card__body">
          <p class="register-card__eyebrow">Venue owner registration</p>
          <h1 class="register-card__title">List Your Venue</h1>
          <p class="register-card__subtitle">
            Fill in your details below. Your account will be active within 24 hours after admin review.
          </p>

          <form class="register-form" @submit.prevent="handleSubmit">

            <!-- Organization Name -->
            <div class="register-form__group">
              <label class="register-form__label">Organization / Venue Name</label>
              <input
                v-model="orgName"
                class="register-form__field"
                type="text"
                autocomplete="organization"
                placeholder="e.g. City Sports Arena"
              />
            </div>

            <!-- Owner Name -->
            <div class="register-form__group">
              <label class="register-form__label">Your Full Name</label>
              <input
                v-model="ownerName"
                class="register-form__field"
                type="text"
                autocomplete="name"
                placeholder="e.g. Rahim Uddin"
              />
            </div>

            <!-- Phone -->
            <div class="register-form__group">
              <label class="register-form__label">Phone Number</label>
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
                />
              </div>
            </div>

            <!-- Email -->
            <div class="register-form__group">
              <label class="register-form__label">Email Address</label>
              <input
                v-model="email"
                class="register-form__field"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
              />
            </div>

            <!-- Password -->
            <div class="register-form__group">
              <label class="register-form__label">Password</label>
              <input
                v-model="password"
                class="register-form__field"
                type="password"
                autocomplete="new-password"
                placeholder="Min. 6 characters"
              />
            </div>

            <p v-if="error" class="register-form__message register-form__message--error">{{ error }}</p>

            <button class="register-form__primary" type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Submitting...' : 'Submit Application' }}
            </button>

            <p class="register-form__hint">
              Already have an account?
              <RouterLink to="/login" class="register-form__link">Sign in</RouterLink>
            </p>
          </form>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped lang="scss">
.register-shell {
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
    padding: 2rem 0;
  }
}

.register-card {
  width: min(100%, 34rem);
  border-radius: 1.75rem;
  border: 1px solid rgb(148 163 184 / 0.18);
  background: rgb(255 255 255 / 0.84);
  box-shadow: 0 28px 90px rgb(79 70 229 / 0.12);
  backdrop-filter: blur(18px);

  &__body {
    padding: 3rem;
  }

  &__body--center {
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
    font-size: clamp(2rem, 5vw, 2.8rem);
    line-height: 0.95;
    font-weight: 900;
    letter-spacing: -0.06em;
  }

  &__subtitle {
    margin: 1rem 0 0;
    color: #475569;
    font-size: 1rem;
    line-height: 1.7;
  }

  &__notice {
    margin: 1rem 0 0;
    color: #64748b;
    font-size: 0.9rem;
    line-height: 1.6;
  }
}

.register-form {
  margin-top: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;

  &__group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__label {
    color: #312e81;
    font-size: 0.9rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__field {
    width: 100%;
    height: 3.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    background: #f8fafc;
    padding: 0 1.2rem;
    font-size: 1rem;
    color: #0f172a;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

    &:focus {
      border-color: #6366f1;
      background: #fff;
      box-shadow: 0 0 0 4px rgb(99 102 241 / 0.14);
    }
  }

  &__primary {
    display: block;
    width: 100%;
    min-height: 3.75rem;
    margin-top: 0.5rem;
    border: 0;
    border-radius: 1rem;
    font-size: 1.05rem;
    font-weight: 800;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    line-height: 3.75rem;
    padding: 0;
    background: linear-gradient(135deg, #312e81 0%, #4f46e5 52%, #6366f1 100%);
    color: #fff;
    box-shadow: 0 18px 32px rgb(79 70 229 / 0.28);
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.7;
      transform: none;
    }
  }

  &__secondary {
    display: block;
    width: 100%;
    min-height: 3.75rem;
    border: 0;
    border-radius: 1rem;
    font-size: 1.05rem;
    font-weight: 800;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    line-height: 3.75rem;
    padding: 0;
    background: #eef2ff;
    color: #312e81;
    transition: background 0.2s ease;

    &:hover {
      background: #e0e7ff;
    }
  }

  &__message {
    margin: 0;
    font-size: 0.95rem;

    &--error {
      color: #dc2626;
    }
  }

  &__hint {
    margin: 0;
    color: #64748b;
    font-size: 0.92rem;
    text-align: center;
  }

  &__link {
    color: #4f46e5;
    font-weight: 700;
    text-decoration: none;
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
    height: 3.75rem;
    border: 0;
    background: transparent;
    font-size: 1rem;
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

.success-badge {
  width: 4.5rem;
  height: 4.5rem;
  display: grid;
  place-items: center;
  margin: 0 auto 1.5rem;
  border-radius: 1.25rem;
  background: linear-gradient(180deg, #dcfce7 0%, #bbf7d0 100%);
  color: #16a34a;
  font-size: 2rem;
  font-weight: 900;
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-top: 2rem;
}

@media (max-width: 640px) {
  .register-shell {
    padding: 1.25rem;
  }

  .register-card__body {
    padding: 2rem 1.4rem;
  }
}
</style>
