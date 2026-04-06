<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import AppButton from '@/components/common/AppButton.vue'

const auth = useAuthStore()
const isEditing = ref(false)
const success = ref('')
const error = ref('')

const form = reactive({
  name: auth.user?.name ?? '',
  email: auth.user?.email ?? '',
  phone: auth.user?.phone ?? '',
})

async function saveProfile() {
  error.value = ''
  success.value = ''
  try {
    await auth.updateProfile({ name: form.name, email: form.email })
    success.value = 'Profile updated successfully!'
    isEditing.value = false
  } catch (e: unknown) {
    error.value = (e as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Update failed'
  }
}

function cancelEdit() {
  form.name = auth.user?.name ?? ''
  form.email = auth.user?.email ?? ''
  isEditing.value = false
}
</script>

<template>
  <div class="profile-page">
    <div class="container">
      <h1 class="profile-page__title">My Profile</h1>

      <div class="profile-page__layout">
        <!-- Profile card -->
        <div class="profile-card">
          <div class="profile-card__avatar">
            {{ auth.user?.name.charAt(0).toUpperCase() }}
          </div>
          <div class="profile-card__info">
            <h2 class="profile-card__name">{{ auth.user?.name }}</h2>
            <p class="profile-card__phone">📞 {{ auth.user?.phone }}</p>
            <p v-if="auth.user?.email" class="profile-card__email">✉️ {{ auth.user?.email }}</p>
          </div>

          <div class="profile-card__meta">
            <div class="profile-card__meta-item">
              <span class="profile-card__meta-label">Member since</span>
              <span class="profile-card__meta-value">
                {{ auth.user?.createdAt ? new Date(auth.user.createdAt).toLocaleDateString('en-BD', { month: 'long', year: 'numeric' }) : '—' }}
              </span>
            </div>
            <div class="profile-card__meta-item">
              <span class="profile-card__meta-label">Wallet</span>
              <RouterLink to="/wallet" class="profile-card__meta-value profile-card__wallet-link">
                ৳{{ (auth.user as {walletBalance?: number})?.walletBalance?.toFixed(2) ?? '0.00' }}
              </RouterLink>
            </div>
          </div>
        </div>

        <!-- Edit form -->
        <div class="profile-form-card">
          <div class="profile-form-card__header">
            <h2 class="profile-form-card__title">Personal Information</h2>
            <button v-if="!isEditing" class="btn btn--outline btn--sm" @click="isEditing = true">
              ✏️ Edit
            </button>
          </div>

          <div v-if="success" class="profile-form-card__success">✅ {{ success }}</div>

          <div class="profile-form-card__fields">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input
                v-model="form.name"
                type="text"
                :class="['form-input', !isEditing && 'opacity-60']"
                :disabled="!isEditing"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input
                v-model="form.email"
                type="email"
                :class="['form-input', !isEditing && 'opacity-60']"
                :disabled="!isEditing"
                placeholder="Optional"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input
                :value="form.phone"
                type="tel"
                class="form-input opacity-60"
                disabled
              />
              <p class="text-xs text-slate-400 mt-1">Phone number cannot be changed</p>
            </div>
          </div>

          <p v-if="error" class="text-sm text-red-600 mt-3">{{ error }}</p>

          <div v-if="isEditing" class="profile-form-card__actions">
            <AppButton :loading="auth.isLoading" @click="saveProfile">Save Changes</AppButton>
            <AppButton variant="ghost" @click="cancelEdit">Cancel</AppButton>
          </div>
        </div>

        <!-- Quick links -->
        <div class="profile-links">
          <RouterLink to="/bookings" class="profile-link">
            <span class="profile-link__icon">📅</span>
            <span class="profile-link__label">My Bookings</span>
            <span class="profile-link__arrow">→</span>
          </RouterLink>
          <RouterLink to="/wallet" class="profile-link">
            <span class="profile-link__icon">💰</span>
            <span class="profile-link__label">Wallet & Transactions</span>
            <span class="profile-link__arrow">→</span>
          </RouterLink>
          <a href="#" class="profile-link">
            <span class="profile-link__icon">🔔</span>
            <span class="profile-link__label">Notification Settings</span>
            <span class="profile-link__arrow">→</span>
          </a>
          <button class="profile-link profile-link--danger" @click="auth.logout()">
            <span class="profile-link__icon">🚪</span>
            <span class="profile-link__label">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-page {
  padding-block: 2.5rem 4rem;
  background: $color-surface;
  min-height: 100vh;

  &__title {
    font-size: 1.75rem;
    font-weight: 800;
    color: $color-dark;
    margin-bottom: 1.5rem;
  }

  &__layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;

    @media (min-width: $bp-md) { grid-template-columns: 280px 1fr; }
  }
}

.profile-card {
  background: linear-gradient(135deg, #0f172a, #15803d);
  border-radius: $radius-card;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  height: fit-content;

  &__avatar {
    width: 5rem;
    height: 5rem;
    border-radius: 50%;
    background: $color-primary;
    border: 3px solid rgb(255 255 255 / 0.2);
    color: $color-white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 800;
  }

  &__info { color: $color-white; }
  &__name { font-size: 1.125rem; font-weight: 700; }
  &__phone, &__email { font-size: 0.875rem; color: rgb(255 255 255 / 0.7); margin-top: 0.25rem; }

  &__meta {
    width: 100%;
    display: flex;
    gap: 1rem;
    justify-content: center;
    border-top: 1px solid rgb(255 255 255 / 0.1);
    padding-top: 1rem;
  }

  &__meta-item {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    align-items: center;
  }

  &__meta-label { font-size: 0.75rem; color: rgb(255 255 255 / 0.5); }
  &__meta-value { font-size: 0.9375rem; font-weight: 700; color: $color-white; }

  &__wallet-link {
    text-decoration: none;
    color: #4ade80 !important;
    &:hover { text-decoration: underline; }
  }
}

.profile-form-card {
  background: $color-white;
  border-radius: $radius-card;
  border: 1px solid $color-border;
  padding: 1.5rem;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }

  &__title { font-size: 1rem; font-weight: 700; color: $color-dark; }

  &__success {
    padding: 0.75rem 1rem;
    background: $color-primary-light;
    color: $color-primary-dark;
    border-radius: $radius-btn;
    font-weight: 600;
    font-size: 0.875rem;
    margin-bottom: 1.25rem;
  }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }
}

.profile-links {
  display: flex;
  flex-direction: column;
  background: $color-white;
  border-radius: $radius-card;
  border: 1px solid $color-border;
  overflow: hidden;
  height: fit-content;

  @media (min-width: $bp-md) { grid-column: 1 / -1; }
  @media (min-width: $bp-lg) { grid-column: auto; }
}

.profile-link {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid $color-border;
  text-decoration: none;
  color: $color-dark-soft;
  transition: background $transition-base;
  cursor: pointer;
  background: none;
  border-left: none;
  border-right: none;
  border-top: none;
  font-size: 0.9375rem;
  font-weight: 500;
  text-align: left;
  width: 100%;

  &:last-child { border-bottom: none; }
  &:hover { background: $color-surface; }

  &--danger {
    color: #dc2626;
    &:hover { background: #fef2f2; }
  }

  &__icon { font-size: 1.25rem; }
  &__label { flex: 1; }
  &__arrow { color: $color-muted; font-size: 0.875rem; }
}
</style>
