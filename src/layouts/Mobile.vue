<script setup lang="ts">
import { computed } from "vue";
import Header from "../components/shared/HeaderMobile.vue";
import { useRoute } from "vue-router";
const route = useRoute();

const isAuthPage = computed(() => {
  return ["login", "register"].includes(route.name as string);
});
</script>

<template>
  <div class="flex justify-center items-center min-h-screen h-auto">
    <div class="shadow-2xl min-h-screen h-auto w-full max-w-md flex flex-col">
      <Header v-if="!isAuthPage" />

      <div class="w-full bg-secondary pt-20 px-5 pb-24 flex-1 h-full">
        <slot />
      </div>
    </div>
  </div>
</template>
