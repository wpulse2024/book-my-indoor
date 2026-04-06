<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <!-- Brand -->
        <div>
          <div class="footer__brand">
            <span class="footer__brand-icon">⚽</span>
            <span class="footer__brand-name">BookMyIndoor</span>
          </div>
          <p class="footer__tagline">Discover & book indoor sports venues near you — turfs, courts, studios and more.</p>
          <div class="footer__social">
            <a href="#" aria-label="Facebook" class="footer__social-link">f</a>
            <a href="#" aria-label="Instagram" class="footer__social-link">in</a>
            <a href="#" aria-label="WhatsApp" class="footer__social-link">w</a>
          </div>
        </div>

        <!-- Venues -->
        <div>
          <h4 class="footer__heading">Sports</h4>
          <ul class="footer__links">
            <li><a href="/venues?type=cricket_turf">Cricket Turf</a></li>
            <li><a href="/venues?type=badminton">Badminton</a></li>
            <li><a href="/venues?type=futsal">Futsal</a></li>
            <li><a href="/venues?type=basketball">Basketball</a></li>
            <li><a href="/venues?type=tennis">Tennis</a></li>
          </ul>
        </div>

        <!-- Company -->
        <div>
          <h4 class="footer__heading">Company</h4>
          <ul class="footer__links">
            <li><a href="#">About Us</a></li>
            <li><a href="#">For Venue Owners</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h4 class="footer__heading">Support</h4>
          <ul class="footer__links">
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Use</a></li>
            <li><a href="#">Refund Policy</a></li>
          </ul>
        </div>
      </div>

      <div class="footer__bottom">
        <p>© {{ new Date().getFullYear() }} BookMyIndoor. All rights reserved.</p>
        <p class="footer__bottom-right">Made with ❤️ for sports lovers</p>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  background: $color-dark;
  color: #94a3b8;
  padding-top: 4rem;
  padding-bottom: 2rem;
  margin-top: auto;

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2.5rem;

    @media (min-width: $bp-sm) { grid-template-columns: repeat(2, 1fr); }
    @media (min-width: $bp-lg) { grid-template-columns: 2fr 1fr 1fr 1fr; }
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;

    &-icon { font-size: 1.5rem; }
    &-name { font-size: 1.125rem; font-weight: 800; color: $color-white; }
  }

  &__tagline {
    font-size: 0.875rem;
    line-height: 1.6;
    max-width: 22rem;
    margin-bottom: 1.25rem;
  }

  &__social {
    display: flex;
    gap: 0.75rem;
  }

  &__social-link {
    width: 2.25rem;
    height: 2.25rem;
    border: 1px solid #334155;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 700;
    color: #94a3b8;
    text-decoration: none;
    transition: all $transition-base;

    &:hover {
      border-color: $color-primary;
      color: $color-primary;
    }
  }

  &__heading {
    font-size: 0.875rem;
    font-weight: 700;
    color: $color-white;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 1rem;
  }

  &__links {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;

    a {
      font-size: 0.9375rem;
      color: #94a3b8;
      text-decoration: none;
      transition: color $transition-base;
      &:hover { color: $color-white; }
    }
  }

  &__bottom {
    border-top: 1px solid #1e293b;
    margin-top: 3rem;
    padding-top: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.875rem;

    @media (min-width: $bp-md) {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
