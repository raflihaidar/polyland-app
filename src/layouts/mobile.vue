<script setup lang="ts">
import Header from "../components/shared/HeaderMobile.vue";
import Navigation from "../components/shared/NavMobile.vue";
</script>

<template>
  <div class="w-full min-h-screen flex flex-col">
    <Header />

    <!-- Tambahkan pb-24 -->
    <div class="w-full bg-secondary pt-20 px-5 pb-24 flex-1">
      <slot />
    </div>

    <Navigation />
  </div>
</template>