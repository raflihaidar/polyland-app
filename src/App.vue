<template>
  <UApp :toaster="toasterConfig">
    <RouterView />
  </UApp>
</template>

<script setup lang="ts">
const toasterConfig = {
  position: "top-right", // Options: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
};

import { useAuthStore } from "./stores/auth.store";
const store = useAuthStore();
store.attempt();
</script>
