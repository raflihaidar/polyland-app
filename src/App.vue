<template>
  <UApp :toaster="toasterConfig">
    <RouterView />
  </UApp>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
const toasterConfig = {
  position: "top-right",
};

import { useAuthStore } from "./stores/auth.store";
const store = useAuthStore();

onMounted(() => {
  store.attempt();
});
</script>
