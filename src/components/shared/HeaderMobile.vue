<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { inject, computed } from "vue";

const route = useRoute();
const router = useRouter();
const title = inject("head-title", null);

const exclude = ["public.home", "aktaku", "profile"];

const isMainPage = computed(() => {
  return exclude.includes(route.name as string);
});
</script>

<template>
  <header
    v-if="route.name === 'public.home'"
    class="w-full bg-white left-1/2 transform -translate-x-1/2 max-w-md h-16 max-h-16 flex z-50 justify-between items-center py-5 px-3 fixed top-0 shadow-xs"
  >
    <div class="flex items-center w-1/2 p-0">
      <div class="bg-secondary rounded-full text-white">
        <img src="@/assets/jejak-tanahku-logo.png" alt="" class="w-12 h-12" />
      </div>

      <h1 class="font-semibold">
        Jejak <span class="text-primary">Tanahku</span>
      </h1>
    </div>
    <UIcon
      name="tabler:bell"
      class="text-primary size-7 w-fit cursor-pointer"
    />
  </header>
  <header
    v-else
    class="w-full bg-white flex items-center z-50 p-5 fixed top-0 left-1/2 transform -translate-x-1/2 max-w-md h-16 max-h-16 shadow-xs"
  >
    <UIcon
      v-if="!isMainPage"
      name="ri:arrow-left-line"
      class="size-6"
      @click="router.back"
    />
    <p class="text-center w-full font-semibold">{{ route.meta?.title }}</p>
  </header>
</template>
