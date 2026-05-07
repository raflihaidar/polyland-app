<template>
  <UApp>
    <router-view></router-view>
  </UApp>
</template>

<script setup lang="ts">
import { useAuthStore } from "./stores/auth.store";
const store = useAuthStore();
store.attempt();
</script>
