<script setup lang="ts">
import { computed } from "vue";
import Header from "../components/shared/HeaderMobile.vue";
import { useRoute } from "vue-router";

const route = useRoute();

const isAuthPage = computed(() => {
  return ["login", "register"].includes(route.name as string);
});

console.log("page : ", route.name);
</script>

<template>
  <div class="min-h-screen flex justify-center bg-gray-100">
    <!-- Mobile Container -->
    <div
      class="relative w-full max-w-md min-h-screen bg-white shadow-2xl overflow-hidden flex flex-col"
    >
      <!-- Header -->
      <Header v-if="!isAuthPage" />

      <!-- Content -->
      <main class="flex-1 w-full bg-secondary px-5 pt-20 pb-24 overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>
