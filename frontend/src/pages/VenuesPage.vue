<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVenueStore } from '@/stores/venue.store'
import VenueCard from '@/components/venue/VenueCard.vue'
import VenueFilters from '@/components/venue/VenueFilters.vue'
import AppSpinner from '@/components/common/AppSpinner.vue'
import type { VenueType } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useVenueStore()

function applyRouteQuery() {
  if (route.query.search) store.filters.search = String(route.query.search)
  if (route.query.type) store.filters.type = String(route.query.type) as VenueType | ''
  if (route.query.area) store.filters.area = String(route.query.area)
  if (route.query.date) store.filters.date = String(route.query.date)
}

function doSearch() {
  router.replace({
    query: {
      ...(store.filters.search ? { search: store.filters.search } : {}),
      ...(store.filters.type ? { type: store.filters.type } : {}),
      ...(store.filters.area ? { area: store.filters.area } : {}),
      ...(store.filters.date ? { date: store.filters.date } : {}),
    },
  })
  store.fetchVenues(1)
}

function goPage(page: number) {
  store.fetchVenues(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  applyRouteQuery()
  store.fetchVenues(1)
})

watch(() => route.query, applyRouteQuery)
</script>

<template>
  <div class="venues-page">
    <!-- Page header -->
    <div class="venues-page__header">
      <div class="container">
        <h1 class="venues-page__title">Find Indoor Venues</h1>
        <p class="venues-page__subtitle">{{ store.pagination?.total ?? '—' }} venues available</p>
      </div>
    </div>

    <div class="container venues-page__body">
      <!-- Filters -->
      <aside class="venues-page__filters">
        <VenueFilters v-model="store.filters" @search="doSearch" />
      </aside>

      <!-- Results -->
      <section class="venues-page__results">
        <div v-if="store.isLoading" class="venues-page__loading">
          <AppSpinner size="lg" />
        </div>

        <template v-else>
          <div v-if="store.venues.length === 0" class="venues-page__empty">
            <span class="venues-page__empty-icon">🏟️</span>
            <h3>No venues found</h3>
            <p>Try adjusting your filters or search in a different area.</p>
            <button class="btn btn--outline mt-4" @click="store.resetFilters(); doSearch()">
              Clear Filters
            </button>
          </div>

          <div v-else>
            <div class="venues-grid">
              <VenueCard v-for="venue in store.venues" :key="venue.id" :venue="venue" />
            </div>

            <!-- Pagination -->
            <div v-if="store.pagination && store.pagination.totalPages > 1" class="venues-page__pagination">
              <button
                class="btn btn--ghost btn--sm"
                :disabled="store.pagination.page <= 1"
                @click="goPage(store.pagination!.page - 1)"
              >
                ← Prev
              </button>
              <span class="venues-page__page-info">
                Page {{ store.pagination.page }} of {{ store.pagination.totalPages }}
              </span>
              <button
                class="btn btn--ghost btn--sm"
                :disabled="store.pagination.page >= store.pagination.totalPages"
                @click="goPage(store.pagination!.page + 1)"
              >
                Next →
              </button>
            </div>
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.venues-page {
  &__header {
    background: $color-dark;
    padding-block: 2.5rem 2rem;
  }

  &__title {
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 800;
    color: $color-white;
    margin-bottom: 0.25rem;
  }

  &__subtitle {
    font-size: 0.9375rem;
    color: rgb(255 255 255 / 0.6);
  }

  &__body {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding-top: 1.5rem;
    padding-bottom: 4rem;

    @media (min-width: $bp-lg) { grid-template-columns: 320px 1fr; }
  }

  &__filters {
    @media (max-width: $bp-lg) { order: -1; }
  }

  &__results { min-width: 0; }

  &__loading {
    display: flex;
    justify-content: center;
    padding: 5rem;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 4rem 2rem;
    background: $color-white;
    border-radius: $radius-card;
    border: 1px solid $color-border;

    h3 { font-size: 1.25rem; color: $color-dark; margin-bottom: 0.5rem; }
    p { color: $color-muted; }
  }

  &__empty-icon { font-size: 3rem; margin-bottom: 1rem; }

  &__pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 2.5rem;
  }

  &__page-info { font-size: 0.875rem; color: $color-muted; }
}

.venues-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;

  @media (min-width: $bp-sm) { grid-template-columns: repeat(2, 1fr); }
  @media (min-width: $bp-xl) { grid-template-columns: repeat(3, 1fr); }
}
</style>
