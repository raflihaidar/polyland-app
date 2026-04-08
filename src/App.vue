<template>
    <router-view></router-view>
</template>

<script setup lang="ts">
import { useAuthStore } from "./stores/auth.store";
const store = useAuthStore();
store.attempt();
</script>
