<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVenueStore } from '@/stores/venue.store'
import VenueCard from '@/components/venue/VenueCard.vue'
import AppSpinner from '@/components/common/AppSpinner.vue'

const router = useRouter()
const venueStore = useVenueStore()

const searchQuery = ref('')
const selectedType = ref('')

const venueTypes = [
  { value: 'cricket_turf', label: '🏏 Cricket Turf' },
  { value: 'badminton',    label: '🏸 Badminton' },
  { value: 'futsal',       label: '⚽ Futsal' },
  { value: 'basketball',   label: '🏀 Basketball' },
  { value: 'tennis',       label: '🎾 Tennis' },
  { value: 'gym',          label: '💪 Gym' },
]

const stats = [
  { value: '200+', label: 'Venues Listed' },
  { value: '50K+', label: 'Bookings Made' },
  { value: '15+',  label: 'Cities Covered' },
  { value: '4.8★', label: 'Average Rating' },
]

const steps = [
  { icon: '🔍', title: 'Find a Venue', desc: 'Search by sport, area, date and time to discover the perfect indoor venue near you.' },
  { icon: '📅', title: 'Pick a Slot', desc: 'See real-time availability and choose from available time slots that fit your schedule.' },
  { icon: '⚡', title: 'Book Instantly', desc: "Confirm your booking in seconds. No calls, no waiting — pay online and you're done." },
  { icon: '📱', title: 'Show Your QR', desc: 'Get a QR code for your booking. Scan at the venue gate for hassle-free check-in.' },
]

function search() {
  router.push({ name: 'venues', query: { search: searchQuery.value, type: selectedType.value } })
}

function browseType(type: string) {
  router.push({ name: 'venues', query: { type } })
}

onMounted(() => {
  venueStore.fetchVenues(1)
})
</script>

<template>
  <div class="home">
    <!-- ── Hero ── -->
    <section class="hero">
      <div class="hero__bg" />
      <div class="container hero__content">
        <div class="hero__text animate-fade-in">
          <div class="hero__eyebrow">🇧🇩 Bangladesh's #1 Indoor Venue Platform</div>
          <h1 class="hero__title">Book Your Perfect<br /><span class="hero__title-accent">Indoor Venue</span></h1>
          <p class="hero__subtitle">Discover and book cricket turfs, badminton courts, futsal arenas, studios and more — near you, right now.</p>
        </div>

        <!-- Search box -->
        <div class="hero__search animate-slide-up">
          <div class="hero__search-inner">
            <div class="hero__search-field">
              <span>🔍</span>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search venues or areas..."
                class="hero__search-input"
                @keyup.enter="search"
              />
            </div>
            <div class="hero__search-divider" />
            <div class="hero__search-field">
              <span>🏟️</span>
              <select v-model="selectedType" class="hero__search-input">
                <option value="">All Sports</option>
                <option v-for="t in venueTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
            </div>
            <button class="hero__search-btn" @click="search">
              Find Venues
            </button>
          </div>
        </div>

        <!-- Sport type pills -->
        <div class="hero__types">
          <button
            v-for="t in venueTypes"
            :key="t.value"
            class="hero__type-pill"
            @click="browseType(t.value)"
          >
            {{ t.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- ── Stats ── -->
    <section class="stats">
      <div class="container stats__grid">
        <div v-for="stat in stats" :key="stat.label" class="stats__item">
          <span class="stats__value">{{ stat.value }}</span>
          <span class="stats__label">{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <!-- ── Featured venues ── -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">Featured Venues</h2>
            <p class="section-subtitle">Top-rated venues trusted by thousands of players</p>
          </div>
          <RouterLink to="/venues" class="btn btn--outline btn--sm">View All →</RouterLink>
        </div>

        <div v-if="venueStore.isLoading" class="venues-loading">
          <AppSpinner size="lg" />
        </div>
        <div v-else class="venues-grid">
          <VenueCard
            v-for="venue in venueStore.venues.slice(0, 6)"
            :key="venue.id"
            :venue="venue"
          />
        </div>

        <div v-if="!venueStore.isLoading && venueStore.venues.length === 0" class="venues-empty">
          <p>No venues found. Check back soon!</p>
        </div>
      </div>
    </section>

    <!-- ── How it works ── -->
    <section id="how-it-works" class="section how-it-works">
      <div class="container">
        <div class="text-center mb-12">
          <h2 class="section-title">How It Works</h2>
          <p class="section-subtitle">Book a venue in under 60 seconds</p>
        </div>
        <div class="how-it-works__grid">
          <div v-for="(step, i) in steps" :key="step.title" class="how-it-works__step">
            <div class="how-it-works__step-number">{{ i + 1 }}</div>
            <div class="how-it-works__step-icon">{{ step.icon }}</div>
            <h3 class="how-it-works__step-title">{{ step.title }}</h3>
            <p class="how-it-works__step-desc">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── CTA ── -->
    <section class="cta">
      <div class="container cta__inner">
        <div class="cta__text">
          <h2 class="cta__title">Own a Sports Venue?</h2>
          <p class="cta__subtitle">List your venue on BookMyIndoor and start getting bookings from thousands of active players in your city.</p>
        </div>
        <div class="cta__actions">
          <a href="#" class="btn btn--accent btn--lg">List Your Venue</a>
          <a href="#" class="btn btn--outline btn--lg" style="color:white;border-color:white;">Learn More</a>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
// ── Hero ────────────────────────────────────────────────────────────────────
.hero {
  position: relative;
  min-height: 85vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #0f172a 0%, #1a3a2a 55%, #15803d 100%);
  overflow: hidden;
  padding-block: 5rem;

  &__bg {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 20% 50%, rgb(22 163 74 / 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgb(249 115 22 / 0.1) 0%, transparent 40%);
  }

  &__content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2rem;
  }

  &__eyebrow {
    display: inline-flex;
    align-items: center;
    padding: 0.375rem 0.875rem;
    background: rgb(255 255 255 / 0.1);
    border: 1px solid rgb(255 255 255 / 0.2);
    border-radius: 99px;
    color: rgb(255 255 255 / 0.85);
    font-size: 0.875rem;
    font-weight: 600;
  }

  &__title {
    font-size: clamp(2.25rem, 5vw, 3.75rem);
    font-weight: 800;
    color: $color-white;
    line-height: 1.15;
    letter-spacing: -0.03em;
  }

  &__title-accent {
    color: #4ade80;
  }

  &__subtitle {
    font-size: clamp(1rem, 2vw, 1.125rem);
    color: rgb(255 255 255 / 0.7);
    max-width: 36rem;
    line-height: 1.65;
  }

  &__search {
    width: 100%;
    max-width: 48rem;
  }

  &__search-inner {
    display: flex;
    align-items: center;
    background: $color-white;
    border-radius: 1rem;
    box-shadow: 0 20px 60px -10px rgb(0 0 0 / 0.4);
    overflow: hidden;

    @media (max-width: $bp-md) {
      flex-direction: column;
      border-radius: $radius-card;
    }
  }

  &__search-field {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 1rem 1.25rem;
    flex: 1;

    @media (max-width: $bp-md) {
      width: 100%;
      border-bottom: 1px solid $color-border;
    }
  }

  &__search-input {
    border: none;
    outline: none;
    background: transparent;
    font-size: 0.9375rem;
    color: $color-dark;
    width: 100%;
    &::placeholder { color: #94a3b8; }
  }

  &__search-divider {
    width: 1px;
    height: 2rem;
    background: $color-border;
    flex-shrink: 0;
    @media (max-width: $bp-md) { display: none; }
  }

  &__search-btn {
    background: $color-primary;
    color: $color-white;
    border: none;
    font-weight: 700;
    font-size: 0.9375rem;
    padding: 1rem 2rem;
    cursor: pointer;
    transition: background $transition-base;
    white-space: nowrap;
    flex-shrink: 0;

    &:hover { background: $color-primary-dark; }

    @media (max-width: $bp-md) {
      width: 100%;
      padding: 0.875rem;
      border-radius: 0;
    }
  }

  &__types {
    display: flex;
    flex-wrap: wrap;
    gap: 0.625rem;
  }

  &__type-pill {
    background: rgb(255 255 255 / 0.12);
    border: 1px solid rgb(255 255 255 / 0.2);
    color: $color-white;
    font-size: 0.8125rem;
    font-weight: 600;
    padding: 0.375rem 0.875rem;
    border-radius: 99px;
    cursor: pointer;
    transition: all $transition-base;
    backdrop-filter: blur(8px);

    &:hover {
      background: rgb(255 255 255 / 0.22);
      border-color: rgb(255 255 255 / 0.4);
    }
  }
}

// ── Stats ───────────────────────────────────────────────────────────────────
.stats {
  background: $color-white;
  border-bottom: 1px solid $color-border;
  padding-block: 2.5rem;

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;

    @media (min-width: $bp-md) { grid-template-columns: repeat(4, 1fr); }
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.25rem;
    padding: 1rem;
  }

  &__value {
    font-size: 2rem;
    font-weight: 800;
    color: $color-primary;
    letter-spacing: -0.02em;
  }

  &__label {
    font-size: 0.875rem;
    color: $color-muted;
    font-weight: 500;
  }
}

// ── Section header ──────────────────────────────────────────────────────────
.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

// ── Venues grid ─────────────────────────────────────────────────────────────
.venues-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: $bp-sm) { grid-template-columns: repeat(2, 1fr); }
  @media (min-width: $bp-lg) { grid-template-columns: repeat(3, 1fr); }
}

.venues-loading {
  display: flex;
  justify-content: center;
  padding: 4rem;
}

.venues-empty {
  text-align: center;
  padding: 4rem;
  color: $color-muted;
}

// ── How it works ─────────────────────────────────────────────────────────────
.how-it-works {
  background: $color-white;

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;

    @media (min-width: $bp-sm) { grid-template-columns: repeat(2, 1fr); }
    @media (min-width: $bp-lg) { grid-template-columns: repeat(4, 1fr); }
  }

  &__step {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.875rem;
    padding: 2rem 1.5rem;
    border-radius: $radius-card;
    border: 1px solid $color-border;
    position: relative;
    transition: all $transition-smooth;

    &:hover {
      border-color: $color-primary;
      box-shadow: 0 0 0 4px $color-primary-light;
    }
  }

  &__step-number {
    position: absolute;
    top: -0.875rem;
    left: 50%;
    transform: translateX(-50%);
    width: 1.75rem;
    height: 1.75rem;
    background: $color-primary;
    color: $color-white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 800;
  }

  &__step-icon { font-size: 2.5rem; }

  &__step-title {
    font-size: 1rem;
    font-weight: 700;
    color: $color-dark;
  }

  &__step-desc {
    font-size: 0.875rem;
    color: $color-muted;
    line-height: 1.65;
  }
}

// ── CTA ──────────────────────────────────────────────────────────────────────
.cta {
  background: linear-gradient(135deg, #0f172a, #15803d);
  padding-block: 5rem;

  &__inner {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2rem;

    @media (min-width: $bp-lg) {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  &__title {
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    font-weight: 800;
    color: $color-white;
    margin-bottom: 0.5rem;
  }

  &__subtitle {
    font-size: 1rem;
    color: rgb(255 255 255 / 0.7);
    max-width: 36rem;
    line-height: 1.65;
  }

  &__actions {
    display: flex;
    gap: 1rem;
    flex-shrink: 0;
    flex-wrap: wrap;
  }
}
</style>
