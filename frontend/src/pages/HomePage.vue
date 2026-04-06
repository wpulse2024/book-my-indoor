<script setup lang="ts">
import TheNavbar from '@/components/TheNavbar.vue'
import HeroSection from '@/components/HeroSection.vue'
import BrowseCategories from '@/components/BrowseCategories.vue'
import TopRatedArenas from '@/components/TopRatedArenas.vue'
import HowItWorks from '@/components/HowItWorks.vue'
import OwnerCTA from '@/components/OwnerCTA.vue'
import TheFooter from '@/components/TheFooter.vue'
</script>

<template>
  <div class="min-h-screen bg-white font-sans">
    <TheNavbar />
    <main>
      <HeroSection />
      <BrowseCategories />
      <TopRatedArenas />
      <HowItWorks />
      <OwnerCTA />
    </main>
    <TheFooter />
  </div>
</template>
