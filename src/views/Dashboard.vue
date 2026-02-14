<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "../stores/auth.store";

const store = useAuthStore();
</script>

<template>
    <p>Selamat Datang di Jejak Tanah</p>
</template>
