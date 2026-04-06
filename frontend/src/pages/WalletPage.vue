<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBookingStore } from '@/stores/booking.store'
import AppButton from '@/components/common/AppButton.vue'
import AppSpinner from '@/components/common/AppSpinner.vue'

const bookingStore = useBookingStore()
const topupAmount = ref<number>(500)
const topupMethod = ref<'sslcommerz' | 'bkash'>('sslcommerz')
const error = ref('')
const success = ref('')
const showTopup = ref(false)

const quickAmounts = [200, 500, 1000, 2000, 5000]

async function doTopup() {
  error.value = ''
  success.value = ''
  if (!topupAmount.value || topupAmount.value < 50) {
    error.value = 'Minimum top-up amount is ৳50'
    return
  }
  try {
    const result = await bookingStore.topupWallet(topupAmount.value, topupMethod.value)
    if (result.redirectUrl) {
      window.location.href = result.redirectUrl
    } else {
      success.value = `৳${topupAmount.value} added to your wallet!`
      showTopup.value = false
      await bookingStore.fetchWallet()
      await bookingStore.fetchWalletTransactions()
    }
  } catch (e: unknown) {
    error.value = (e as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Top-up failed'
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleString('en-BD', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

onMounted(async () => {
  await bookingStore.fetchWallet()
  await bookingStore.fetchWalletTransactions()
})
</script>

<template>
  <div class="wallet-page">
    <div class="container">
      <h1 class="wallet-page__title">My Wallet</h1>

      <!-- Balance card -->
      <div class="wallet-balance-card">
        <div class="wallet-balance-card__bg" />
        <div class="wallet-balance-card__content">
          <span class="wallet-balance-card__label">Available Balance</span>
          <span class="wallet-balance-card__amount">৳{{ bookingStore.walletBalance.toFixed(2) }}</span>
          <p class="wallet-balance-card__note">Use your wallet to pay for bookings instantly</p>
        </div>
        <button class="wallet-balance-card__topup-btn" @click="showTopup = !showTopup">
          + Add Money
        </button>
      </div>

      <!-- Success message -->
      <div v-if="success" class="wallet-page__success">✅ {{ success }}</div>

      <!-- Top-up panel -->
      <Transition name="slide-down">
        <div v-if="showTopup" class="topup-panel">
          <h2 class="topup-panel__title">Add Money to Wallet</h2>

          <div class="form-group mb-4">
            <label class="form-label">Amount (৳)</label>
            <div class="topup-panel__quick-amounts">
              <button
                v-for="a in quickAmounts"
                :key="a"
                :class="['topup-panel__quick-btn', { 'topup-panel__quick-btn--active': topupAmount === a }]"
                @click="topupAmount = a"
              >
                ৳{{ a.toLocaleString() }}
              </button>
            </div>
            <input
              v-model.number="topupAmount"
              type="number"
              class="form-input mt-3"
              placeholder="Or enter custom amount"
              min="50"
            />
          </div>

          <div class="form-group mb-5">
            <label class="form-label">Payment Method</label>
            <div class="topup-panel__methods">
              <label :class="['topup-method', { 'topup-method--active': topupMethod === 'sslcommerz' }]">
                <input v-model="topupMethod" type="radio" value="sslcommerz" class="sr-only" />
                💳 SSLCommerz (Card/bKash/Nagad)
              </label>
              <label :class="['topup-method', { 'topup-method--active': topupMethod === 'bkash' }]">
                <input v-model="topupMethod" type="radio" value="bkash" class="sr-only" />
                📱 bKash Direct
              </label>
            </div>
          </div>

          <p v-if="error" class="text-sm text-red-600 mb-3">{{ error }}</p>

          <div class="flex gap-3">
            <AppButton :loading="bookingStore.isLoading" @click="doTopup">
              Add ৳{{ topupAmount?.toLocaleString() ?? '—' }}
            </AppButton>
            <AppButton variant="ghost" @click="showTopup = false">Cancel</AppButton>
          </div>
        </div>
      </Transition>

      <!-- Transactions -->
      <div class="wallet-page__transactions">
        <h2 class="wallet-page__transactions-title">Transaction History</h2>

        <div v-if="bookingStore.isLoading && bookingStore.walletTransactions.length === 0" class="wallet-page__loading">
          <AppSpinner size="md" />
        </div>

        <div v-else-if="bookingStore.walletTransactions.length === 0" class="wallet-page__empty">
          <span>💸</span>
          <p>No transactions yet. Add money to get started.</p>
        </div>

        <div v-else class="transactions-list">
          <div
            v-for="tx in bookingStore.walletTransactions"
            :key="tx.id"
            class="transaction-item"
          >
            <div class="transaction-item__icon" :class="`transaction-item__icon--${tx.type}`">
              {{ tx.type === 'credit' ? '↓' : '↑' }}
            </div>
            <div class="transaction-item__info">
              <span class="transaction-item__desc">{{ tx.description }}</span>
              <span class="transaction-item__date">{{ formatDate(tx.createdAt) }}</span>
            </div>
            <span
              :class="['transaction-item__amount', `transaction-item__amount--${tx.type}`]"
            >
              {{ tx.type === 'credit' ? '+' : '-' }}৳{{ tx.amount.toLocaleString() }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wallet-page {
  padding-block: 2.5rem 4rem;

  &__title {
    font-size: 1.75rem;
    font-weight: 800;
    color: $color-dark;
    margin-bottom: 1.5rem;
  }

  &__success {
    margin: 1rem 0;
    padding: 0.875rem 1.25rem;
    background: $color-primary-light;
    color: $color-primary-dark;
    border-radius: $radius-btn;
    font-weight: 600;
    font-size: 0.9375rem;
  }

  &__transactions { margin-top: 2.5rem; }

  &__transactions-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: $color-dark;
    margin-bottom: 1rem;
  }

  &__loading {
    display: flex;
    justify-content: center;
    padding: 3rem;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 3rem;
    text-align: center;
    color: $color-muted;
    font-size: 1.5rem;

    p { font-size: 1rem; }
  }
}

.wallet-balance-card {
  position: relative;
  border-radius: 1.25rem;
  overflow: hidden;
  padding: 2rem;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;

  &__bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #0f172a, #15803d);
    z-index: 0;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 80% 20%, rgb(74 222 128 / 0.2), transparent 60%);
    }
  }

  &__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__label {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgb(255 255 255 / 0.7);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  &__amount {
    font-size: clamp(2.5rem, 5vw, 3.5rem);
    font-weight: 800;
    color: $color-white;
    letter-spacing: -0.03em;
    line-height: 1;
  }

  &__note {
    font-size: 0.8125rem;
    color: rgb(255 255 255 / 0.5);
    margin-top: 0.25rem;
  }

  &__topup-btn {
    position: relative;
    z-index: 1;
    background: $color-accent;
    color: $color-white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    font-weight: 700;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: background $transition-base;
    flex-shrink: 0;

    &:hover { background: $color-accent-dark; }
  }
}

.topup-panel {
  background: $color-white;
  border-radius: $radius-card;
  border: 1px solid $color-border;
  padding: 1.5rem;
  margin-bottom: 1.5rem;

  &__title {
    font-size: 1rem;
    font-weight: 700;
    color: $color-dark;
    margin-bottom: 1.25rem;
  }

  &__quick-amounts {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  &__quick-btn {
    padding: 0.375rem 0.875rem;
    border-radius: 99px;
    border: 1.5px solid $color-border;
    font-size: 0.875rem;
    font-weight: 600;
    background: $color-white;
    color: $color-dark-soft;
    cursor: pointer;
    transition: all $transition-base;

    &--active, &:hover {
      border-color: $color-primary;
      background: $color-primary-light;
      color: $color-primary-dark;
    }
  }

  &__methods {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
}

.topup-method {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: 1.5px solid $color-border;
  border-radius: $radius-btn;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all $transition-base;
  color: $color-dark-soft;

  &--active {
    border-color: $color-primary;
    background: $color-primary-light;
    color: $color-primary-dark;
  }
}

.transactions-list {
  display: flex;
  flex-direction: column;
  background: $color-white;
  border-radius: $radius-card;
  border: 1px solid $color-border;
  overflow: hidden;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid $color-border;
  transition: background $transition-base;

  &:last-child { border-bottom: none; }
  &:hover { background: $color-surface; }

  &__icon {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 700;
    flex-shrink: 0;

    &--credit { background: $color-primary-light; color: $color-primary-dark; }
    &--debit  { background: #fef2f2; color: #dc2626; }
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  &__desc {
    font-size: 0.9375rem;
    font-weight: 600;
    color: $color-dark;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__date { font-size: 0.8125rem; color: $color-muted; }

  &__amount {
    font-size: 1rem;
    font-weight: 700;
    flex-shrink: 0;

    &--credit { color: $color-primary; }
    &--debit  { color: #dc2626; }
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 600px;
  opacity: 1;
}
</style>
