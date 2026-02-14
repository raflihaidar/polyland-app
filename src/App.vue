<template>
    <UApp>
        <RouterView />
    </UApp>
</template>

<script setup>
import { useAuthStore } from "./stores/auth.store";
const store = useAuthStore();

store.attempt();
</script>
