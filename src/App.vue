<template>
    <UApp :toaster="toaster">
        <RouterView />
    </UApp>
</template>

<script setup lang="ts">
import { useAuthStore } from "./stores/auth.store";
const store = useAuthStore();
const toaster = { position: 'top-right' }
store.attempt();
</script>
