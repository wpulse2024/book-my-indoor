<template>
  <div class="not-found">
    <div class="not-found__inner">
      <div class="not-found__code">404</div>
      <h1 class="not-found__title">Page Not Found</h1>
      <p class="not-found__subtitle">The page you're looking for doesn't exist or has been moved.</p>
      <RouterLink to="/" class="btn btn--primary btn--lg mt-6">Go Home</RouterLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.not-found {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  &__inner { display: flex; flex-direction: column; align-items: center; }

  &__code {
    font-size: 7rem;
    font-weight: 800;
    color: $color-primary;
    line-height: 1;
    letter-spacing: -0.04em;
    opacity: 0.15;
  }

  &__title {
    font-size: 1.75rem;
    font-weight: 800;
    color: $color-dark;
    margin-top: -1rem;
  }

  &__subtitle {
    color: $color-muted;
    margin-top: 0.5rem;
    max-width: 28rem;
  }
}
</style>
